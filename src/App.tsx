import React from 'react'
import './App.css'
import Header from './components/Header'

function App() {
  return (
    <div className="app">
      <main className="content">
      <Header />
        <section id="home" className="section">
          <h2>Welcome to Our Website</h2>
          <p>This is a demonstration of a sticky header with smooth scrolling navigation.</p>
        </section>

        <section id="about" className="section">
          <h2>About Us</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </section>

        <section id="services" className="section">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Service 1</h3>
              <p>Description of service 1 goes here.</p>
            </div>
            <div className="service-card">
              <h3>Service 2</h3>
              <p>Description of service 2 goes here.</p>
            </div>
            <div className="service-card">
              <h3>Service 3</h3>
              <p>Description of service 3 goes here.</p>
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <h2>Contact Us</h2>
          <p>Get in touch with us for more information about our services.</p>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" />
            <input type="email" placeholder="Your Email" />
            <textarea placeholder="Your Message"></textarea>
            <button type="submit">Send Message</button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
