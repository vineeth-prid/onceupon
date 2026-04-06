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

          {/* Product column */}
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
              Product
            </h4>
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <Link
                to="/templates"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Templates
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
              <Link
                to="/about"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* Occasions column */}
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
              Occasions
            </h4>
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <Link
                to="/templates"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Children's Books
              </Link>
              <Link
                to="/templates"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Wedding & Love
              </Link>
              <Link
                to="/templates"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Pregnancy
              </Link>
              <Link
                to="/templates"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Life Milestones
              </Link>
            </nav>
          </div>

          {/* Support column */}
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
              Support
            </h4>
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <Link
                to="/faq"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                FAQ
              </Link>
              <Link
                to="/contact"
                className="font-body no-underline"
                style={{
                  fontSize: "0.85rem",
                  color: "#6F6F6F",
                  transition: "color 0.2s",
                }}
              >
                Contact Us
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
                Privacy Policy
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
          className="max-w-6xl mx-auto flex justify-between items-center"
          style={{ flexWrap: "wrap", gap: "0.5rem" }}
        >
          <p
            className="font-body"
            style={{ fontSize: "0.78rem", color: "#999", margin: 0 }}
          >
            Once Upon a Time &copy; {new Date().getFullYear()} All rights
            reserved
          </p>
          <p
            className="font-body"
            style={{ fontSize: "0.78rem", color: "#999", margin: 0 }}
          >
            Made for every story worth telling
          </p>
        </div>
      </div>
    </footer>
  );
}
