import React, { Component, ChangeEvent, MouseEvent } from 'react'
import { Container, Row, Col, ListGroup, Image, ButtonToolbar, Button, Form, FormControl, Jumbotron } from 'react-bootstrap'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import cookie from 'react-cookies'
import { Editor } from '@tinymce/tinymce-react'
import Dynamic from '../components/dynamic'

import './articles.css'

import config from '../config'
import Article from '../interfaces/article'

interface Params {
	article_id?: string
}

interface State {
	articles: Array<Article>
	article?: Article
	loaded: boolean
	edit: boolean
	dirty: boolean
	accessToken: string|null
	jwt: any|null
}

class Articles extends Component<RouteComponentProps<Params>, State> {

	constructor(props: any, context: any) {
		super(props, context)

		this.state = {
			articles: [],
			loaded: false,
			edit: false,
			dirty: false,
			accessToken: null,
			jwt: null
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

		if ( accessToken ) {
			if ( this.state.accessToken !== accessToken ) {
				const tokenBody = accessToken.split('.')[1]
				const decodableTokenBody = tokenBody.replace(/-/g, '+').replace(/_/g, '/')
				const jwt = JSON.parse(Buffer.from(decodableTokenBody, 'base64').toString())

				this.setState( { accessToken: accessToken, jwt: jwt } ) ;
			}
		} else {
			if ( this.state.accessToken ) {
				this.setState( { accessToken: null, jwt: null } ) ;
			}
		}

		return accessToken;
	}

	getArticles = async () => {
		try {
			const jwtToken = this.getToken()
			let params = { method: 'GET', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + jwtToken } }
			let response = await fetch(config.api.URL + '/articles', params)
			let articles = await response.json()

			this.setState({ articles: articles, loaded: true })

			return articles
		} catch (error) {

			this.setState({ articles: [{ id: "temp", name: "temp", owner: "temp", title: "No API", description: "Manage articles here once API is implemented", content: "" }], loaded: true })
			console.log("Error getting article: ", error)
		}
	}

	createArticle = async (article: Article) => {
		try {
			let jwtToken = this.getToken();
			let json = JSON.stringify(article);
			let params = { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: 'Bearer ' + jwtToken }, body: json };
			let response = await fetch(config.api.URL + '/articles', params);
			let result = await response.json();

			return result;
		} catch (error) {
			console.log("Error creating article: ", error);
		}
	}

	updateArticle = async (article: Article) => {
		try {
			let jwtToken = this.getToken();
			let json = JSON.stringify(article);
			let params = { method: 'PUT', headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: 'Bearer ' + jwtToken }, body: json };
			let response = await fetch(config.api.URL + '/articles/' + article.id, params);
			let result = await response.json();

			return result;
		} catch (error) {
			console.log("Error updating article: ", error);
		}
	}

	deleteArticle = async (article: Article) => {
		try {
			let jwtToken = this.getToken();
			let params = { method: 'DELETE', headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: 'Bearer ' + jwtToken } };
			let response = await fetch(config.api.URL + '/articles/' + article.id, params);
			let result = response.ok;

			return result;
		} catch (error) {
			console.log("Error deleting article: ", error);
		}
	}

	onAddArticle = () => {
		const article = { id: "", name: "", owner: "", title: "", description: "", content: "" }
		this.setState({ article: article, edit: true })
		this.props.history.push("/articles/new")
	}

	onEditArticle = () => {
		this.setState({ edit: true })
	}

	onViewArticle = (event: MouseEvent<HTMLElement>) => {
		if (event.currentTarget) {
			const { articles } = this.state
			const article = articles[parseInt(event.currentTarget.id)]
			this.setState({ article: article, edit: false })
			this.props.history.push("/articles/" + article.name)
		}
	}

	onSaveArticle = async () => {
		const { article } = this.state;

		if (!article) return

		let response = null 
		if (article.id) {
			response = await this.updateArticle(article)
		} else {
			response = await this.createArticle(article)
		}

		if ( Date.now() > this.state.jwt.exp * 1000 ) {
			alert( "Access Token has expired" )
			return 
		}

		console.log( response ) 

		this.setState({ edit: false })
	}

	onCancel = () => {
		this.setState({ edit: false })
	}

	onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { dirty, article } = this.state;

		if (!event) return
		if (!event.target) return
		if (!article) return

		article.title = event.currentTarget.value;

		if (!dirty) {
			this.setState({ dirty: true });
		}
	}

	onEditorChange = (newContent: string) => {
		const { dirty, article } = this.state;

		if (!article) return

		article.content = newContent;

		if (!dirty) {
			this.setState({ dirty: true });
		}
	}

	renderArticleList = () => {
		const { articles } = this.state
		const token = this.getToken();

		return (
			<Container className="articles-container">
				<Jumbotron>
					<h1>Articles</h1>
				</Jumbotron>
				<Container fluid className="articles-list-container">
					<Row style={{ margin: '0px' }}>
						<Col style={{ padding: '0px' }} xs={12} sm={12}>
							<ListGroup className="article-list-group">
								<ListGroup.Item variant="primary" className="article-list-title">
									<Row >
										<Col className="article-list-image-col" xs={10} sm={10} lg={10}>
											<h3>Articles</h3>
										</Col>
										{token
											? <Col xs={2} sm={2} lg={2}>
												<ButtonToolbar className="justify-content-end align-center">
													<Button variant="primary" size='sm' onClick={this.onAddArticle}>New</Button>
												</ButtonToolbar>
											</Col>
											: null
										}
									</Row>
								</ListGroup.Item>
								{articles.map((article, index) => {
									return (
										<ListGroup.Item id={String(index)} key={index} variant="light" action onClick={this.onViewArticle} className="article-list-item">
											<Row className="flex-nowrap">
												<Col className="article-list-image-col" xs={3} sm={3} lg={2}>
													<Image className="article-list-image" fluid src="https://via.placeholder.com/100" />
												</Col>
												<Col className="article-list-text-col" xs={9} sm={9} lg={10}>
													<span className="article-title">{article.title}</span><br />
													<span className="article-description">{article.description}</span><br />
													<span className="article-sinfo"><small>Last Updated 23/01/2020</small></span>
												</Col>
											</Row>
										</ListGroup.Item>
									)
								})}
							</ListGroup>
						</Col>
					</Row>
				</Container>
			</Container>
		)
	}

	renderArticleView = () => {
		let { articles, article, loaded } = this.state
		const { article_id } = this.props.match.params
		const token = this.getToken();

		if (!loaded) return <Container></Container>
		if (!article) {
			article = articles.find(({ name }) => name === article_id)
			if (!article) {
				return <h1>Article Not Found</h1>
			}
		}

		return (
			<Container className="articles-container">
				{token
					? <Jumbotron className="articles-view-jumbotron">
						<h1>{article.title}</h1>
						<ButtonToolbar className="float-right ml-auto justify-content-end">
							<Button className="mr-2" variant="primary" size='sm' onClick={this.onEditArticle}>Edit</Button>
						</ButtonToolbar>
					</Jumbotron>
					: <Jumbotron className="articles-view-jumbotron">
						<h1>{article.title}</h1>
					</Jumbotron>
				}
				<Container className="articles-view-container">
					<Dynamic content={article.content}/>
				</Container>
			</Container>
		)
	}

	renderArticleEdit = () => {
		let { articles, article, dirty, jwt } = this.state
		const { article_id } = this.props.match.params

		if (!article) {
			article = articles.find(({ name }) => name === article_id)
			if (!article) {
				article = { id: "", name: "", owner: "", title: "", description: "", content: "" }
			}
		}

		let expiry = null 
		try {
			if ( jwt ) {
				console.log( jwt ) 
				expiry = new Date( jwt.exp * 1000 ).toString()
				console.log( expiry )
			} 
		} catch (error ) {
			console.log( error ) 
		}

		return (

			<Container className="articles-container">
				<Form>
					<Jumbotron>
						<FormControl id="title" name="title" defaultValue={article.title} placeholder="Untitled" onChange={this.onFieldChange} />
						<p>{expiry}</p>
						<ButtonToolbar className="float-right ml-auto justify-content-end">
							<Button className="mr-2" variant="primary" size='sm' onClick={this.onSaveArticle} disabled={!dirty}>Save</Button>
							<Button className="mr-2" variant="primary" size='sm' onClick={this.onCancel}>Cancel</Button>
						</ButtonToolbar>
					</Jumbotron>
					<Editor
						apiKey='xdlxqnf8mqguhjq4tbtqekuoyct1abgtzzy6x0ow3e0jlizo'
						value={article.content}
						init={{
							height: 65 + 'vh',
							branding: false,
							//								toolbar: false,
							browser_spellcheck: true,
							contextmenu: false,
							menubar: true,
							wordcount: false,
							resize: true,
							relative_urls: false,
							remove_script_host: false,
							//								document_base_url : "http://sans-caffeine.com",
							plugins: [
								'advlist autolink lists link image charmap print preview anchor',
								'searchreplace visualblocks code fullscreen quickbars template',
								'insertdatetime media table paste code help emoticons ',
								'save codesample pagebreak'
							],
							//toolbars not enables - save (uses a form)
							toolbar1: 'undo redo | ' +
								'bold italic underline strikethrough | ' +
								'fontselect fontsizeselect formatselect | ' +
								'alignleft aligncenter alignright alignjustify | ' +
								'outdent indent |  numlist bullist | ',
							toolbar2:
								'forecolor backcolor removeformat | ' +
								'pagebreak | charmap emoticons | ' +
								'code fullscreen preview print | ' +
								'image media template link anchor codesample | a11ycheck ltr rtl ',
							codesample_languages: [
								{ text: 'Terraform', value: 'hcl'},
								{ text: 'bash', value: 'bash' },
								{ text: 'TypeScript', value: 'typescript' },
								{ text: 'JSON', value: 'json' },
								{ text: 'JavaScript', value: 'javascript' },
								{ text: 'HTML/XML', value: 'markup' },
								{ text: 'CSS', value: 'css' },
								{ text: 'Java', value: 'java' },
							],
						}}
						onEditorChange={this.onEditorChange}
					//							disabled={true}
					/>

				</Form>
			</Container>
		)
	}

	render = () => {
		const { edit } = this.state
		const { article_id } = this.props.match.params

		if (article_id) {
			if (edit) {
				return this.renderArticleEdit()
			} else {
				return this.renderArticleView()
			}
		} else {
			return this.renderArticleList()
		}
	}
}

export default withRouter(Articles)