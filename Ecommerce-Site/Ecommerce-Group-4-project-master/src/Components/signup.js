import React,{ useState } from 'react';
import './signup.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';
import { signup } from '../Services/apiServices';

export const Signup =()=> { 
  const navigate = useNavigate();

    const [formData , setFormData] = useState({ // useState is use to store the data that the user writes in the field in the form.
      firstName: '',
      lastName: '',
      email:'',
      password:''
    });

    const handleChange = (e) => {
     setFormData({
      ...formData,
      [e.target.name]: e.target.value
     });
    };

    const notify = () => toast("Successfully Registered");
   
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission
        try {
          const response = await signup(formData);
          notify();
          setTimeout(() => {
            navigate('/');
        }, 1000);  
        }

        catch (error) {
          alert('Error during signup, please try again.');
        }
    };

   return (
    <div className="container">
      <form onSubmit={handleSubmit}>
      <h1 className='heading'> SIGNUP </h1>
        <label>
          First Name
          <input type="text" name="firstName" value= {formData.firstName} onChange = {handleChange} />
        </label>
        <label>
          Last Name
          <input type="text" name="lastName" value= {formData.lastName} onChange = {handleChange} />
        </label>
        <label id='email'>
          Email
          <input type="text" name="email" value = {formData.email} onChange={handleChange}/>
        </label>

        <label>
          Password
          <input type="password" name="password" value = {formData.password}  onChange={handleChange}/>
        </label>
      
          <button type="submit" name="submit" class ='submit_btn'> REGISTER </button>
          <Link to="/" className='links'> Already have an account ? Login </Link>
    
          <ToastContainer />
      </form>
    </div>
   );
}



