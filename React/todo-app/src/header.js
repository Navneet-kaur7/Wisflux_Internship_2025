import React from 'react'
import { Nav,Navbar, Container } from 'react-bootstrap';

export default function Header() {
  return (
     <>
      
      <Navbar bg="primary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#home">TO-DO APP</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#About">About</Nav.Link>
          
          </Nav>
        </Container>
      </Navbar>

    
      
    </>
  );
}
