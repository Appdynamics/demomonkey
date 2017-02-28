import React from 'react';
import showdown from 'showdown';

class Welcome extends React.Component {
    render() {

        var readme = require('../../README.md');
        var converter = new showdown.Converter({
          'prefixHeaderId':'welcome ',
          'ghCompatibleHeaderId': true,
          'simplifiedAutoLink': true
        });

        var html = converter.makeHtml(readme);

        return (
          <div className="content" dangerouslySetInnerHTML={{__html: html}}></div>

        );
    }
}

export default Welcome
