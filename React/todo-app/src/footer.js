import React from 'react';
import { MDBFooter, MDBContainer, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';

export default function Footer() {
  return (
    <>
      <MDBFooter className='text-center text-white' style={{ backgroundColor: '#f1f1f1' }}>
        <MDBContainer className='pt-4'>
          <section className='mb-4'>
            <MDBBtn
              rippleColor="dark"
              color='link'
              floating
              size="lg"
              className='m-1'
              href='#!'
              role='button'
            >
              <MDBIcon fab className='fa-facebook-f' style={{ color: '#212529' }} />
            </MDBBtn>

            <MDBBtn
              rippleColor="dark"
              color='link'
              floating
              size="lg"
              className='m-1'
              href='#!'
              role='button'
            >
              <MDBIcon fab className='fa-twitter' style={{ color: '#212529' }} />
            </MDBBtn>

            <MDBBtn
              rippleColor="dark"
              color='link'
              floating
              size="lg"
              className='m-1'
              href='#!'
              role='button'
            >
              <MDBIcon fab className='fa-google' style={{ color: '#212529' }} />
            </MDBBtn>

            <MDBBtn
              rippleColor="dark"
              color='link'
              floating
              size="lg"
              className='m-1'
              href='#!'
              role='button'
            >
              <MDBIcon fab className='fa-instagram' style={{ color: '#212529' }} />
            </MDBBtn>

            <MDBBtn
              rippleColor="dark"
              color='link'
              floating
              size="lg"
              className='m-1'
              href='#!'
              role='button'
            >
              <MDBIcon fab className='fa-linkedin' style={{ color: '#212529' }} />
            </MDBBtn>

            <MDBBtn
              rippleColor="dark"
              color='link'
              floating
              size="lg"
              className='m-1'
              href='#!'
              role='button'
            >
              <MDBIcon fab className='fa-github' style={{ color: '#212529' }} />
            </MDBBtn>
          </section>
        </MDBContainer>

        <div className='text-center text-dark p-3' style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          © 2025 Copyright TodoApp
          
        </div>
      </MDBFooter>
    </>
  );
}
