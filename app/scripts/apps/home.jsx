'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

const Home = React.createClass({

  getInitialState() {
    return {
      title: 'Home'
    };
  },

  render() {
    return <h1>{ this.state.title }</h1>;
  }
});

ReactDOM.render(
  <Home />,
  document.getElementById('app')
);

