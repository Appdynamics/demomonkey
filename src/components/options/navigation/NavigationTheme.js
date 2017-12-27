export default {
  tree: {
    base: {
      listStyle: 'none',
      backgroundColor: 'rgb(241, 247, 236)',
      margin: 0,
      padding: 0,
      color: '#284907',
      fontSize: '14px'
    },
    node: {
      base: {
        position: 'relative'
      },
      link: {
        cursor: 'pointer',
        position: 'relative',
        padding: '4px',
        width: '100%',
        display: 'block',
        borderTop: '1px solid #a8c987'
      },
      activeLink: {
        background: '#a8c987'
      },
      toggle: {
        base: {
          position: 'relative',
          display: 'inline-block',
          verticalAlign: 'top',
          marginLeft: '-5px',
          height: '24px',
          width: '24px'
        },
        wrapper: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          margin: '-7px 0 0 -7px',
          height: '14px'
        },
        height: 14,
        width: 14,
        arrow: {
          fill: '#9DA5AB',
          strokeWidth: 0
        }
      },
      header: {
        folder: {
          display: 'inline-block',
          verticalAlign: 'top',
          color: '#284907',
          width: 'calc(100% - 24px)'
        },
        item: {
          display: 'inline-block',
          verticalAlign: 'top',
          color: '#284907',
          width: '100%'
        },
        connector: {
          width: '2px',
          height: '12px',
          borderLeft: 'solid 2px black',
          borderBottom: 'solid 2px black',
          position: 'absolute',
          top: '0px',
          left: '-21px'
        },
        title: {
          lineHeight: '24px',
          verticalAlign: 'middle',
          display: 'inline-block',
          width: 'calc(100% - 80px)'
        },
        timestamp: {
          color: '#888888',
          fontSize: '80%',
          display: 'inline-block',
          textAlign: 'right',
          width: '68px'
        }
      },
      subtree: {
        listStyle: 'none',
        paddingLeft: '19px'
      },
      loading: {
        color: '#E2C089'
      }
    }
  }
}
