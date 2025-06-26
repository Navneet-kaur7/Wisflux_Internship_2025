import React,{ useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { login } from '../Services/apiServices';

export const Login = () => {
  const navigate = useNavigate();

  const [formData , setFormData] = useState({ // useState is use to store the data that the user writes in the field in the form.
    email:'',
    password:''
  });

  const handleChange = (e) => {
   setFormData({
    ...formData,
    [e.target.name]: e.target.value
   });
  };

  const notify = () => toast("Login Successful");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Form data:', formData); 
    try {
      const response = await login(formData) ;   // calling the API in login.js file
      notify();
      setTimeout(() => {
        navigate('/');
    }, 1000);  
    }

    catch (error) {
      alert('Error during login, please try again.');
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="main">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value= {formData.email} onChange = {handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value = {formData.password} onChange = {handleChange} required  />
        </div>
        <button type="submit">Login</button>
      </form>
      <h5 id="pink">Not a user? Click here <button type="button" onClick={handleSignUp}>Sign up</button></h5>
      <ToastContainer />
    </div>
  );
};
