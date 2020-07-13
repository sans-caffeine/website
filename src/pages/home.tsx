import React, { Component } from 'react'
import { Container } from "react-bootstrap"
import cookie from 'react-cookies'
import { Editor } from '@tinymce/tinymce-react';

import './home.css'

import config from '../config'

interface Article {
	id: string
	name: string
	title: string
	content: string
	owner: string
}

interface Props {

}

interface State {
	articles: Array<Article>
	loaded: boolean
}

const homeArticle1: Article = { id: "Home", name: "home", title: "Home", owner: "blank", content: "<h1>Static Website</h1><p>Congratulations on creating your static website</p><p>Now you can proceed to the next stage and add some dynamic content</p>" }
const homeArticle2: Article = { id: "Home", name: "home", title: "Home", owner: "blank", content: "<h1>Dymamic Content</h1><p>Congratulations on adding dynamic content to your website</p><p>Create an article called Home and it will replace this placeholder</p>" }

const defaultHomePage = {
	"id": "6070942c-bdd7-44bc-8c68-fe6c1d6236f1",
	"owner": "admin",
	"name": "home",
	"title": "Dynamic Content",
	"description": "The Home Page",
	"content": "<h1>Welcome</h1>",
	"updated": {
		"at": "2020-06-27T07:26:53.366Z",
		"by": "e166d1b7-4039-4450-8f48-4aea5db0e899"
	}
}

class Home extends Component<Props, State> {

	constructor(props: any, context: any) {
		super(props, context)

		this.state = {
			articles: [],
			loaded: false
		}
	}

	componentDidMount = async () => {
		this.getArticles()
	}

	getToken = () => {
		const client_id = config.authentication.AUTH_CLIENT;

		const cookie_user = 'CognitoIdentityServiceProvider.' + client_id + '.LastAuthUser';
		const username = cookie.load(cookie_user);
		const cookie_accessToken = 'CognitoIdentityServiceProvider.' + client_id + '.' + username + '.accessToken';
		const accessToken = cookie.load(cookie_accessToken);

		return accessToken;
	}

	getArticles = async () => {
		try {
			const jwtToken = this.getToken()
			let params = { method: 'GET', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + jwtToken } }
			let response = await fetch(config.api.URL + '/articles', params)
			let articles = await response.json()

			if ( articles.length === 0 ) {
				this.loadHomePage() ;
			}

			this.setState({ articles: articles, loaded: true })

			return articles;
		} catch (error) {

			console.log("Error getting article: ", error)
		}
	}

	loadHomePage = async () => {

		try {
			const jwtToken = this.getToken()
			let params = { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + jwtToken }, body: JSON.stringify(defaultHomePage) }
			await fetch(config.api.URL + '/articles', params)
			let articles = [defaultHomePage] ;

			this.setState({ articles: articles, loaded: true })

			return articles;
		} catch (error) {

			console.log("Error getting article: ", error)
		}
	}

	handleEditorChange = () => {

	}

	render = () => {
		const { articles, loaded } = this.state;
		const article = loaded ? articles.find(({ name }) => name === "home") || homeArticle2 : homeArticle1

		return (
			<Container className="home-container">
				<Editor
					value={article.content}
					apiKey='xdlxqnf8mqguhjq4tbtqekuoyct1abgtzzy6x0ow3e0jlizo'
					id='sans-editor'
					init={{
						branding: false,
						toolbar: false,
						menubar: false,
						wordcount: false,
						inline: true,
					}}
					onEditorChange={this.handleEditorChange}
					disabled={true}
				/>
			</Container>
		)
	}
}

export default Home 
