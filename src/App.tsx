import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Container, Navbar, Nav } from 'react-bootstrap'

import {Helmet} from 'react-helmet'
//import ReactGA from 'react-ga' 

import './App.css'

import Home from './pages/home' 
import Admin from './pages/admin'
import Articles from './pages/articles'
import config from './config'

class App extends Component {

	render = () => {
		return (
			<Container fluid className="app-container">
 			<Router>
				<Helmet>
					<meta charSet="utf-8" />
					<meta name="description" content={config.application.description}/>
					<title>{config.application.title}</title>
				</Helmet>
				<Navbar style={{paddingTop:0, paddingBottom:0}} collapseOnSelect bg="dark" variant="dark" fixed="top" expand="lg">
          <Navbar.Brand href="/">
            Sans Demo
          </Navbar.Brand>
          <Navbar.Toggle />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="mr-auto">
							<Nav.Link href="/articles">Articles</Nav.Link>
						</Nav>
						<Nav>
	 						<Nav.Link href="/admin">Admin</Nav.Link>
						</Nav>
					</Navbar.Collapse>
       	</Navbar>
				<Navbar style={{paddingTop:0, paddingBottom:0}} fixed="bottom" variant="dark" bg="dark">
					<Navbar.Brand>
						&copy; Sans Caffeine 2019-2020
					</Navbar.Brand>
				</Navbar> 
				<Switch>
					<Route path="/" exact component={Home} />
					<Route path="/admin" exact component={Admin} />
					<Route path="/articles" exact component={Articles} />
					<Route path="/articles/:article_id" component={Articles} />
				</Switch>
			</Router>
			</Container>
		)
	}
}

export default App
