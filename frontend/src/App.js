import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import cookie from 'react-cookies';
import {Redirect} from 'react-router';


class App extends Component {

  constructor(props){
        //Call the constrictor of Super class i.e The Component
        super(props);
        //maintain the state required for this component
        this.state = {
            first : "0",
            second : "0",
            
            authFlag : false,
            status:"",
            operation:"+",

        }
        //Bind the handlers to this class
        this.firstChangeHandler = this.firstChangeHandler.bind(this);
        this.secondChangeHandler = this.secondChangeHandler.bind(this);
        
        this.submitButton = this.submitButton.bind(this);
        this.operationChangeHandler = this.operationChangeHandler.bind(this);
    }
    //Call the Will Mount to set the auth Flag to false
    componentWillMount(){
        this.setState({
            authFlag : false
        })
    }
    //username change handler to update state variable with the text entered by the user
    firstChangeHandler = (e) => {
        this.setState({
            first : e.target.value
        })
    }
    secondChangeHandler = (e) => {
        this.setState({
            second : e.target.value
        })
    }
 

    operationChangeHandler = (e) => {
        this.setState({
            operation : e.target.value
        })
    }
    



    //submit Login handler to send a request to the node backend
    submitButton = (e) => {
        var headers = new Headers();
        //prevent page from refresh
        e.preventDefault();
        const data = {
            first : this.state.first,
            second : this.state.second,
            operation : this.state.operation,
        }
        //set the with credentials to true
        axios.defaults.withCredentials = true;
        //make a post request with the user data
        axios.post('http://localhost:3001/Calculator',data)
            .then(response => {
                console.log("Status Code : ",response.status);
                if(response.status === 200){
                    this.setState({
                        authFlag : true,
                        status:response.data,
                    })
                }
                else{
                    console.log("Status Code : ",response.status);
                    this.setState({
                        
                        status:response.data
                    })
                }
                    

               
            });
    }
  render(){
        //redirect based on successful login
       
        

        return(
            
            <div>
                
            <div class="container">
                
                <div class="login-form">
                    <div class="main-div">
                        <div class="panel">
                            <h2>Calculator</h2>
                            
                        </div>
                        
                            <div class="form-group">
                                <input onChange = {this.firstChangeHandler} type="number" class="form-control" name="bookid" placeholder="1st value" required autocomplete="off"/>
                            </div>
                           


                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="+"  onChange ={this.operationChangeHandler} required />
                               <label class="form-check-label" for="exampleRadios1">
                                    Addition
                                </label>
                            </div>
                              <div class="form-check">
                              <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="-" onChange ={this.operationChangeHandler} required/>
                              <label class="form-check-label" for="exampleRadios2">
                              Subtraction
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios3" value="*" onChange ={this.operationChangeHandler} required/>
                            <label class="form-check-label" for="exampleRadios3">
                             Multiplication
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios3" value="/" onChange ={this.operationChangeHandler} required/>
                            <label class="form-check-label" for="exampleRadios3">
                             Division
                            </label>
                            </div>


                            <div class="form-group">
                                <input onChange = {this.secondChangeHandler} type="number" class="form-control" name="title" placeholder="2nd value" required autocomplete="off"/>
                            </div>
                            <input type="submit" onClick = {this.submitButton} class="btn btn-primary" value="Calulate" /> 
                            <br/>
                            
                            <font color='red'><b><p>Your Query : {this.state.first} {this.state.operation} {this.state.second}</p></b></font>
                            <font color='red'><b><p>{this.state.status}</p></b></font>             
                    </div>

                </div>
            </div>
            </div>
        )
    }
}

export default App;
