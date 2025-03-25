"use client"

import React from "react"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { FiArrowRight, FiCheckCircle, FiShield, FiClock, FiUsers, FiActivity, FiBarChart2 } from "react-icons/fi"

const LandingPage: React.FC = () => {
  // Add scroll animation effect
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll(".animate-on-scroll")

      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top
        const windowHeight = window.innerHeight

        if (elementPosition < windowHeight - 100) {
          element.classList.add("visible")
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    // Trigger once on load
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Modern Healthcare <span>Management</span> Solution
              </h1>
              <p className="hero-subtitle">
                Streamline your healthcare operations with our comprehensive, secure, and user-friendly management
                system designed for modern medical facilities.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </div>
            </div>

            <div className="hero-image">
            <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" width="501.13988" height="500.17774" viewBox="0 0 991.13988 770.17774" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>doctors</title>
  <path d="M394.01076,446.99387c-8.47406,122.45-179.70277,122.45-188.176,0C214.31073,324.54387,385.53644,324.54387,394.01076,446.99387Z" transform="translate(-104.43006 -64.91113)" fill="#f2f2f2"/>
  <path d="M994.01076,695.99387c-8.47406,122.45-179.70277,122.45-188.176,0C814.31073,573.54387,985.53644,573.54387,994.01076,695.99387Z" transform="translate(-104.43006 -64.91113)" fill="#f2f2f2"/>
  <path d="M903.3779,570.31946c0,41.80115,26.21582,75.61673,58.62223,75.61673" transform="translate(-104.43006 -64.91113)" fill="#3f3d56"/>
  <path d="M961.99985,645.93619c0-42.27348,29.25341-76.47993,65.38677-76.47993" transform="translate(-104.43006 -64.91113)" fill="#4285f4"/>
  <path d="M924.60417,573.5621c0,39.69451,16.71312,71.80111,37.39568,71.80111" transform="translate(-104.43006 -64.91113)" fill="#4285f4"/>
  <path d="M961.99985,645.93619c0-54.0026,33.83848-97.73454,75.61674-97.73454" transform="translate(-104.43006 -64.91113)" fill="#3f3d56"/>
  <path d="M949.8325,646.59949s8.31272-.25614,10.81259-2.04139,12.79069-3.92872,13.4144-1.05656,12.49695,14.2386,3.11326,14.30685-21.80117-1.46177-24.29652-2.98534S949.8325,646.59949,949.8325,646.59949Z" transform="translate(-104.43006 -64.91113)" fill="#a8a8a8"/>
  <path d="M977.37466,656.92247c-9.38369.07825-21.80117-1.46177-24.29652-2.98534-1.90616-1.16048-2.66695-5.32115-2.92182-7.24149-.17743.00773-.28.01091-.28.01091s.53129,6.69892,3.02671,8.22248,14.91283,3.06359,24.29652,2.98534c2.70726-.01934,3.39069-.91724,3.34607-2.24547C980.07468,656.39798,979.02513,656.8786,977.22994,656.89282Z" transform="translate(-104.43006 -64.91113)" opacity="0.2"/>
</svg>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>Comprehensive Healthcare Management</h2>
            <p>
              Our platform offers everything you need to manage your healthcare facility efficiently and effectively.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card animate-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>Trusted by Healthcare Professionals</h2>
            <p>See what medical professionals are saying about our healthcare management system.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card animate-on-scroll"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{testimonial.name.charAt(0)}</div>
                  <div className="testimonial-author">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
                <p className="testimonial-quote">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card animate-on-scroll">
            <h2>Ready to Transform Your Healthcare Management?</h2>
            <p>
              Join thousands of healthcare professionals who have streamlined their operations with our comprehensive
              system.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-light">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline">
                Schedule an Appointment <FiArrowRight className="btn-icon" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} School Healthcare Management System. All Rights Reserved.</p>
        </div>
      </footer>

      {/* CSS Styles */}
      <style jsx>{`
        /* Base Styles */
        :root {
          --primary: #1a73e8;
          --primary-dark: #0d47a1;
          --primary-light: #e8f0fe;
          --secondary: #34a853;
          --accent: #fbbc04;
          --dark: #202124;
          --text: #3c4043;
          --text-light: #5f6368;
          --white: #ffffff;
          --gray-light: #f1f3f4;
          --gray: #dadce0;
          --shadow-sm: 0 2px 5px rgba(0, 0, 0, 0.08);
          --shadow-md: 0 4px 10px rgba(0, 0, 0, 0.12);
          --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.15);
          --border-radius: 12px;
          --transition: all 0.3s ease;
        }

        .landing-page {
          font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: var(--text);
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Animation */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Button Styles */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          transition: var(--transition);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .btn-primary {
          background-color: var(--primary);
          color: var(--white);
          border: none;
        }

        .btn-primary:hover {
          background-color: var(--primary-dark);
        }

        .btn-secondary {
          background-color: var(--white);
          color: var(--primary);
          border: 2px solid var(--gray);
        }

        .btn-secondary:hover {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }

        .btn-light {
          background-color: var(--white);
          color: var(--primary);
          border: none;
        }

        .btn-light:hover {
          background-color: var(--gray-light);
        }

        .btn-outline {
          background-color: transparent;
          color: var(--white);
          border: 2px solid var(--white);
        }

        .btn-outline:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .btn-icon {
          margin-left: 8px;
        }

        /* Section Styles */
        section {
          padding: 80px 0;
        }

        .section-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 60px;
        }

        .section-header h2 {
          font-size: 36px;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 16px;
          position: relative;
          display: inline-block;
        }

        .section-header h2::after {
          content: '';
          position: absolute;
          width: 60px;
          height: 3px;
          background-color: var(--primary);
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
        }

        .section-header p {
          font-size: 18px;
          color: var(--text-light);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          padding: 120px 0 100px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f9ff 0%, #ecf4ff 100%);
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
        }

        .hero-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(26, 115, 232, 0.1) 0%, rgba(26, 115, 232, 0.05) 100%);
        }

        .shape-1 {
          width: 400px;
          height: 400px;
          top: -100px;
          right: -100px;
        }

        .shape-2 {
          width: 300px;
          height: 300px;
          bottom: -50px;
          left: -50px;
        }

        .shape-3 {
          width: 200px;
          height: 200px;
          bottom: 100px;
          right: 30%;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .hero-text {
          flex: 1;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
          color: var(--dark);
        }

        .hero-title span {
          color: var(--primary);
          position: relative;
        }

        .hero-title span::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 8px;
          background-color: rgba(26, 115, 232, 0.2);
          bottom: 5px;
          left: 0;
          z-index: -1;
        }

        .hero-subtitle {
          font-size: 18px;
          color: var(--text-light);
          margin-bottom: 32px;
          max-width: 500px;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
        }

        .hero-image {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-image img {
          max-width: 100%;
          height: auto;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* Features Section */
        .features-section {
          background-color: var(--white);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background-color: var(--white);
          border-radius: var(--border-radius);
          padding: 30px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          border-top: 4px solid var(--primary);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-md);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          background-color: var(--primary-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: var(--primary);
        }

        .feature-card h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--dark);
        }

        .feature-card p {
          color: var(--text-light);
          font-size: 16px;
        }

        /* Testimonials Section */
        .testimonials-section {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: var(--white);
        }

        .testimonials-section .section-header h2 {
          color: var(--white);
        }

        .testimonials-section .section-header h2::after {
          background-color: var(--white);
        }

        .testimonials-section .section-header p {
          color: rgba(255, 255, 255, 0.8);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .testimonial-card {
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: var(--border-radius);
          padding: 30px;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .testimonial-avatar {
          width: 50px;
          height: 50px;
          background-color: var(--primary-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
          margin-right: 15px;
        }

        .testimonial-author h4 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 5px;
        }

        .testimonial-author p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .testimonial-quote {
          font-style: italic;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          background-color: var(--white);
          padding: 80px 0;
        }

        .cta-card {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: var(--border-radius);
          padding: 60px 40px;
          text-align: center;
          color: var(--white);
          box-shadow: var(--shadow-lg);
        }

        .cta-card h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .cta-card p {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          max-width: 700px;
          margin: 0 auto 30px;
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        /* Footer */
        .footer {
          background-color: var(--dark);
          color: var(--white);
          padding: 30px 0;
          text-align: center;
        }

        .footer p {
          margin: 0;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Responsive Styles */
        @media (max-width: 992px) {
          .hero-content {
            flex-direction: column;
          }

          .hero-text, .hero-image {
            width: 100%;
            text-align: center;
          }

          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-buttons {
            justify-content: center;
          }

          .hero-title {
            font-size: 36px;
          }

          .section-header h2 {
            font-size: 30px;
          }

          .cta-card {
            padding: 40px 20px;
          }
        }

        @media (max-width: 768px) {
          section {
            padding: 60px 0;
          }

          .hero-section {
            padding: 100px 0 60px;
          }

          .hero-title {
            font-size: 32px;
          }

          .hero-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
          }

          .features-grid, .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

// Features data
const features = [
  {
    title: "Patient Management",
    description: "Efficiently manage patient records, medical history, and appointments in one centralized system.",
    icon: <FiUsers size={24} />,
  },
  {
    title: "Appointment Scheduling",
    description: "Streamline appointment booking, reduce no-shows, and optimize your facility's schedule.",
    icon: <FiClock size={24} />,
  },
  {
    title: "Secure Records",
    description: "Keep patient data secure and compliant with industry standards and regulations.",
    icon: <FiShield size={24} />,
  },
  {
    title: "Prescription Management",
    description: "Manage prescriptions digitally, reducing errors and improving patient safety.",
    icon: <FiActivity size={24} />,
  },
  {
    title: "Billing & Invoicing",
    description: "Simplify the billing process with automated invoicing and payment tracking.",
    icon: <FiCheckCircle size={24} />,
  },
  {
    title: "Analytics & Reporting",
    description: "Gain valuable insights with comprehensive reports and analytics dashboards.",
    icon: <FiBarChart2 size={24} />,
  },
]

// Testimonials data
const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    quote:
      "This system has transformed how we manage patient care. The intuitive interface and comprehensive features have significantly improved our efficiency.",
  },
  {
    name: "Mark Williams",
    role: "Hospital Administrator",
    quote:
      "The reporting capabilities alone have saved us countless hours. We now have real-time insights into our operations that were previously impossible to obtain.",
  },
  {
    name: "Dr. James Chen",
    role: "Family Physician",
    quote:
      "As a busy physician, I appreciate how this system streamlines my workflow. Patient records are easily accessible, and the prescription management is excellent.",
  },
]

export default LandingPage

