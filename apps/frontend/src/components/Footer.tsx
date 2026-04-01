import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer
      className="w-full"
      style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5" }}
    >
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto" style={{ padding: "3rem 2rem 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem",
          }}
        >
          {/* Brand column */}
          <div>
            <Link to="/" className="no-underline">
              <span
                className="font-display"
                style={{
                  fontSize: "1.5rem",
                  color: "#000",
                  letterSpacing: "-0.5px",
                }}
              >
                Once Upon a Time
              </span>
            </Link>
            <p
              className="font-body"
              style={{
                fontSize: "0.85rem",
                color: "#6F6F6F",
                lineHeight: 1.6,
                marginTop: "0.8rem",
                maxWidth: 260,
              }}
            >
              Create hyper-personalized storybooks that make your child the
              hero, with AI-powered illustrations and magical storytelling.
            </p>
          </div>

          {/* About column */}
          <div>
            <h4
              className="font-body"
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#000",
                margin: "0 0 1rem",
              }}
            >
              About
            </h4>
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <Link
                to="/"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Home
              </Link>
              <Link
                to="/create"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Create a Book
              </Link>
              <a
                href="#faq"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                FAQs
              </a>
              <a
                href="#"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Support
              </a>
            </nav>
          </div>

          {/* Customer Area column */}
          <div>
            <h4
              className="font-body"
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#000",
                margin: "0 0 1rem",
              }}
            >
              Customer Area
            </h4>
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <Link
                to="/create"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                My Books
              </Link>
              <a
                href="#"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Orders
              </a>
              <a
                href="#"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Terms
              </a>
              <a
                href="#"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Privacy Policy
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid #e5e5e5",
          padding: "1.2rem 2rem",
        }}
      >
        <div
          className="max-w-6xl mx-auto flex justify-center  items-center"
          style={{ flexWrap: "wrap", gap: "0.5rem" }}
        >
          <p
            className="font-body"
            style={{ fontSize: "0.8rem", color: "#999", margin: 0 }}
          >
            Once Upon a Time &copy; {new Date().getFullYear()} All rights
            reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
