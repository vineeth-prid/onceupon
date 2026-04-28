import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { uploadPhoto } from '../api/orders';

interface DetectedFace {
  id: number;
  box: { x: number; y: number; width: number; height: number };
  role: 'MAIN_CHILD' | 'SIBLING' | 'PARENT' | 'GRANDPARENT';
  name: string;
  age: number;
  gender: string;
  croppedBlob?: Blob;
  croppedPhotoUrl?: string;
  uploading?: boolean;
}

export interface FamilyMemberOutput {
  role: 'MAIN_CHILD' | 'SIBLING' | 'PARENT' | 'GRANDPARENT';
  name: string;
  age: number;
  gender: string;
  croppedPhotoUrl: string;
  sortOrder: number;
}

interface Props {
  accent: string;
  onFamilyData: (data: {
    groupPhotoUrl: string;
    familyMembers: FamilyMemberOutput[];
    mainChildName: string;
    mainChildAge: number;
    mainChildGender: string;
  }) => void;
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  modelsLoaded = true;
}

export function FamilyPhotoUploader({ accent, onFamilyData }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [groupPhotoUrl, setGroupPhotoUrl] = useState('');
  const [allUploaded, setAllUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const detectFaces = useCallback(async (imgElement: HTMLImageElement) => {
    setDetecting(true);
    setError('');
    try {
      await loadModels();
      const detections = await faceapi
        .detectAllFaces(imgElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks();

      if (detections.length === 0) {
        setError('No faces detected. Try a clearer, well-lit photo where all faces are visible.');
        setDetecting(false);
        return;
      }

      if (detections.length === 1) {
        setError('Only 1 face detected. Family mode requires at least 2 people. Try a group photo or switch to Solo mode.');
        setDetecting(false);
        return;
      }

      if (detections.length > 4) {
        setError(`${detections.length} faces detected. Maximum 4 family members allowed. Please use a photo with 2-4 people.`);
        setDetecting(false);
        return;
      }

      // Sort faces left-to-right
      const sorted = [...detections].sort((a, b) => a.detection.box.x - b.detection.box.x);

      // Default assignment: first face = Main Child, second = Father, third = Mother
      const defaultAssignments: Array<{ role: DetectedFace['role']; gender: string; age: number }> = [
        { role: 'MAIN_CHILD', gender: 'boy', age: 5 },
        { role: 'PARENT', gender: 'man', age: 30 },
        { role: 'PARENT', gender: 'woman', age: 28 },
        { role: 'SIBLING', gender: 'boy', age: 5 },
      ];

      const detectedFaces: DetectedFace[] = sorted.map((d, i) => ({
        id: i,
        box: {
          x: d.detection.box.x,
          y: d.detection.box.y,
          width: d.detection.box.width,
          height: d.detection.box.height,
        },
        role: defaultAssignments[i]?.role ?? 'SIBLING' as const,
        name: '',
        age: defaultAssignments[i]?.age ?? 5,
        gender: defaultAssignments[i]?.gender ?? 'boy',
      }));

      // Crop each face with padding
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      for (const face of detectedFaces) {
        const padding = 0.4;
        const padW = face.box.width * padding;
        const padH = face.box.height * padding;
        const cropX = Math.max(0, face.box.x - padW);
        const cropY = Math.max(0, face.box.y - padH);
        const cropW = Math.min(imgElement.naturalWidth - cropX, face.box.width + padW * 2);
        const cropH = Math.min(imgElement.naturalHeight - cropY, face.box.height + padH * 2);

        canvas.width = cropW;
        canvas.height = cropH;
        ctx.drawImage(imgElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png')
        );
        face.croppedBlob = blob;
      }

      setFaces(detectedFaces);
    } catch (err) {
      setError(`Face detection failed: ${(err as Error).message}`);
    }
    setDetecting(false);
  }, []);

  const handleFile = async (file: File) => {
    setPhoto(file);
    setFaces([]);
    setAllUploaded(false);
    setError('');
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);

    // Upload group photo
    try {
      const { url: uploadedUrl } = await uploadPhoto(file);
      setGroupPhotoUrl(uploadedUrl);
    } catch {
      setError('Failed to upload group photo');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Run face detection when image loads
  const handleImageLoad = () => {
    if (imgRef.current) {
      detectFaces(imgRef.current);
    }
  };

  // Draw bounding boxes on canvas
  useEffect(() => {
    if (!canvasRef.current || !imgRef.current || faces.length === 0) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas.getContext('2d')!;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    const scaleX = img.clientWidth / img.naturalWidth;
    const scaleY = img.clientHeight / img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faces.forEach((face, i) => {
      const x = face.box.x * scaleX;
      const y = face.box.y * scaleY;
      const w = face.box.width * scaleX;
      const h = face.box.height * scaleY;

      ctx.strokeStyle = face.role === 'MAIN_CHILD' ? accent : '#4CAF50';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Label
      ctx.fillStyle = face.role === 'MAIN_CHILD' ? accent : '#4CAF50';
      ctx.fillRect(x, y - 20, 24, 20);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillText(`${i + 1}`, x + 7, y - 5);
    });
  }, [faces, accent]);

  // Upload all cropped faces
  const handleUploadFaces = async () => {
    const hasMainChild = faces.some((f) => f.role === 'MAIN_CHILD');
    if (!hasMainChild) {
      setError('Please designate one person as the Main Child');
      return;
    }

    const incomplete = faces.find((f) => !f.name.trim());
    if (incomplete) {
      setError('Please enter a name for each person');
      return;
    }

    setError('');
    const updated = [...faces];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].croppedPhotoUrl) continue;
      updated[i].uploading = true;
      setFaces([...updated]);

      try {
        const file = new File([updated[i].croppedBlob!], `face-${i}.png`, { type: 'image/png' });
        const { url } = await uploadPhoto(file);
        updated[i].croppedPhotoUrl = url;
        updated[i].uploading = false;
      } catch {
        updated[i].uploading = false;
        setError(`Failed to upload face ${i + 1}`);
        setFaces([...updated]);
        return;
      }
    }

    setFaces([...updated]);
    setAllUploaded(true);

    const mainChild = updated.find((f) => f.role === 'MAIN_CHILD')!;
    onFamilyData({
      groupPhotoUrl,
      familyMembers: updated.map((f, i) => ({
        role: f.role,
        name: f.name,
        age: f.age,
        gender: f.gender,
        croppedPhotoUrl: f.croppedPhotoUrl!,
        sortOrder: i,
      })),
      mainChildName: mainChild.name,
      mainChildAge: mainChild.age,
      mainChildGender: mainChild.gender,
    });
  };

  const updateFace = (id: number, field: keyof DetectedFace, value: any) => {
    setFaces((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
    setAllUploaded(false);
  };

  // Explicit relationship options that auto-set role + gender
  const relationshipOptions = [
    { value: 'main-child-boy', label: 'Main Child (Boy)', role: 'MAIN_CHILD' as const, gender: 'boy' },
    { value: 'main-child-girl', label: 'Main Child (Girl)', role: 'MAIN_CHILD' as const, gender: 'girl' },
    { value: 'father', label: 'Father', role: 'PARENT' as const, gender: 'man' },
    { value: 'mother', label: 'Mother', role: 'PARENT' as const, gender: 'woman' },
    { value: 'younger-brother', label: 'Younger Brother', role: 'SIBLING' as const, gender: 'boy' },
    { value: 'younger-sister', label: 'Younger Sister', role: 'SIBLING' as const, gender: 'girl' },
    { value: 'grandfather', label: 'Grandfather', role: 'GRANDPARENT' as const, gender: 'man' },
    { value: 'grandmother', label: 'Grandmother', role: 'GRANDPARENT' as const, gender: 'woman' },
  ];

  // Derive the current relationship value from role + gender
  const getRelationshipValue = (face: DetectedFace): string => {
    if (face.role === 'MAIN_CHILD') return face.gender === 'girl' ? 'main-child-girl' : 'main-child-boy';
    if (face.role === 'PARENT') return face.gender === 'woman' ? 'mother' : 'father';
    if (face.role === 'SIBLING') return face.gender === 'girl' ? 'younger-sister' : 'younger-brother';
    if (face.role === 'GRANDPARENT') return face.gender === 'woman' ? 'grandmother' : 'grandfather';
    return 'main-child-boy';
  };

  const handleRelationshipChange = (faceId: number, relationshipValue: string) => {
    const option = relationshipOptions.find((o) => o.value === relationshipValue);
    if (!option) return;
    setFaces((prev) =>
      prev.map((f) =>
        f.id === faceId
          ? { ...f, role: option.role, gender: option.gender, age: (option.role === 'PARENT' ? 30 : option.role === 'GRANDPARENT' ? 65 : f.age) }
          : f,
      ),
    );
    setAllUploaded(false);
  };

  return (
    <div>
      <label style={{
        display: 'block',
        marginBottom: '0.6rem',
        fontWeight: 700,
        fontFamily: "'Nunito', sans-serif",
        color: '#2d1b69',
        fontSize: '0.95rem',
      }}>
        Upload Family Photo
      </label>
      <p style={{
        margin: '0 0 0.6rem',
        fontFamily: "'Nunito', sans-serif",
        color: '#999',
        fontSize: '0.8rem',
      }}>
        Upload a group photo with 2-4 family members. We'll detect each face automatically.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!photoPreview ? (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? accent : '#ddd'}`,
            borderRadius: 16,
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? `${accent}10` : '#FAFAFA',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>&#128106;</div>
          <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", color: '#999', fontSize: '0.9rem' }}>
            Click or drag a family photo here
          </p>
          <p style={{ margin: '0.3rem 0 0', fontFamily: "'Nunito', sans-serif", color: '#ccc', fontSize: '0.75rem' }}>
            JPEG, PNG, or WebP (max 10MB)
          </p>
        </div>
      ) : (
        <div>
          {/* Photo with face bounding boxes */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <img
              ref={imgRef}
              src={photoPreview}
              alt="Family photo"
              onLoad={handleImageLoad}
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                borderRadius: 16,
                border: `3px solid ${accent}`,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
            {detecting && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '0.8rem 1.5rem',
                borderRadius: 12,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
              }}>
                Detecting faces...
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setPhoto(null);
              setPhotoPreview('');
              setFaces([]);
              setAllUploaded(false);
              setError('');
            }}
            style={{
              background: 'none',
              border: `1px solid ${accent}`,
              color: accent,
              borderRadius: 10,
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            Change photo
          </button>

          {/* Face cards */}
          {faces.length > 0 && (
            <div>
              <p style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                color: '#2d1b69',
                fontSize: '0.95rem',
                margin: '0 0 0.5rem',
              }}>
                {faces.length} face{faces.length > 1 ? 's' : ''} detected — fill in details:
              </p>

              {faces.map((face, i) => (
                <div key={face.id} style={{
                  border: face.role === 'MAIN_CHILD' ? `2px solid ${accent}` : '2px solid #eee',
                  borderRadius: 14,
                  padding: '1rem',
                  marginBottom: '0.8rem',
                  background: face.role === 'MAIN_CHILD' ? `${accent}08` : '#fff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    {face.croppedBlob && (
                      <img
                        src={URL.createObjectURL(face.croppedBlob)}
                        alt={`Face ${i + 1}`}
                        style={{
                          width: 56,
                          height: 56,
                          objectFit: 'cover',
                          borderRadius: 12,
                          border: `2px solid ${face.role === 'MAIN_CHILD' ? accent : '#ddd'}`,
                        }}
                      />
                    )}
                    <span style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      color: '#2d1b69',
                      fontSize: '0.9rem',
                    }}>
                      Person {i + 1}
                    </span>
                    {face.uploading && (
                      <span style={{ color: '#999', fontSize: '0.8rem', fontFamily: "'Nunito', sans-serif" }}>
                        Uploading...
                      </span>
                    )}
                    {face.croppedPhotoUrl && (
                      <span style={{ color: '#4CAF50', fontSize: '0.8rem', fontFamily: "'Nunito', sans-serif" }}>
                        Uploaded
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {/* Name */}
                    <input
                      type="text"
                      placeholder="Name"
                      value={face.name}
                      onChange={(e) => updateFace(face.id, 'name', e.target.value)}
                      maxLength={50}
                      style={{
                        padding: '0.5rem 0.7rem',
                        borderRadius: 10,
                        border: '2px solid #eee',
                        fontSize: '0.9rem',
                        fontFamily: "'Nunito', sans-serif",
                        outline: 'none',
                      }}
                    />

                    {/* Relationship (sets role + gender automatically) */}
                    <select
                      value={getRelationshipValue(face)}
                      onChange={(e) => handleRelationshipChange(face.id, e.target.value)}
                      style={{
                        padding: '0.5rem 0.7rem',
                        borderRadius: 10,
                        border: '2px solid #eee',
                        fontSize: '0.9rem',
                        fontFamily: "'Nunito', sans-serif",
                        outline: 'none',
                        background: '#fff',
                      }}
                    >
                      {relationshipOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    {/* Age */}
                    <input
                      type="number"
                      placeholder="Age"
                      value={face.age}
                      onChange={(e) => updateFace(face.id, 'age', parseInt(e.target.value) || 0)}
                      min={0}
                      max={99}
                      style={{
                        padding: '0.5rem 0.7rem',
                        borderRadius: 10,
                        border: '2px solid #eee',
                        fontSize: '0.9rem',
                        fontFamily: "'Nunito', sans-serif",
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              ))}

              {!allUploaded && (
                <button
                  type="button"
                  onClick={handleUploadFaces}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif",
                    background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    color: '#fff',
                    marginTop: '0.5rem',
                  }}
                >
                  Confirm Family Members
                </button>
              )}

              {allUploaded && (
                <div style={{
                  padding: '0.7rem 1rem',
                  background: '#E8F5E9',
                  borderRadius: 12,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#2E7D32',
                  textAlign: 'center',
                  marginTop: '0.5rem',
                }}>
                  Family members confirmed! Fill in the remaining details below.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{
          color: '#D32F2F',
          marginTop: '0.8rem',
          padding: '0.7rem 1rem',
          background: '#FFEBEE',
          borderRadius: 12,
          fontFamily: "'Nunito', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
