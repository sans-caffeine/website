import React, { Component } from 'react'

import Prism from 'prismjs'
import "prismjs/themes/prism-okaidia.css"
import "prismjs/plugins/toolbar/prism-toolbar.js"
//import "prismjs/plugins/show-language/prism-show-language.js"
//import "prismjs/plugins/line-numbers/prism-line-numbers.js"
import 'prismjs/components/prism-hcl.js'
import 'prismjs/components/prism-bash.js'
import 'prismjs/components/prism-typescript.js'

Prism.highlightAll() 

interface Props {
	content: string
}

interface State {
}

class Dynamic extends Component<Props, State> {

	componentDidMount = () => {
		setTimeout(() => Prism.highlightAll(), 0)
	}

	render = () => {
		const { content } = this.props

		return( 
		  <div dangerouslySetInnerHTML={ { __html: content}} />
		)
	}
}

export default Dynamic