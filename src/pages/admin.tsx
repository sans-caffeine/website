import React, { Component } from 'react'
import { Container } from 'react-bootstrap'

import './admin.css'

class Admin extends Component {
	render = () => {
		return( 
			<Container className="admin-container" >
				<h1>Admin</h1>
				<p>This page will only be accessible by logged in users once authentication is enabled</p>
			</Container>
		)
	}
}

export default Admin 