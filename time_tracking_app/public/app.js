
const TimersDashboard = React.createClass({
  getInitialState: function () {
    return {
      timers: []
    };
  },
  componentDidMount: function () {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 5000);
  },
  loadTimersFromServer: function () {
    client.getTimers( serverTimers => (
      this.setState({ timers: serverTimers })
      )
    );
  },
  handleCreateFormSubmit: function (timer) {
    this.createTimer(timer);
  },
  createTimer: function (timer) {
    const t = helpers.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(t),
    });

    client.createTimer(t, );
  },
  handleEditFormSubmit: function (attrs) {
    this.updateTimer(attrs);
  },
  updateTimer: function (attrs) {
    this.setState({
      timers: this.state.timers.map( timer => {
        if (timer.id === attrs.id) {
          return Object.assign({}, timer, {
            title: attrs.title,
            project: attrs.project,
          });
        } else {
          return timer;
        }
      })
    })

    client.updateTimer(attrs);
  },
  handleDeleteClick: function (timerId) {
    this.deleteTimer(timerId)
  },
  deleteTimer: function (timerId) {
    this.setState({
      timers: this.state.timers.filter( t => t.id !== timerId)
    });

    client.deleteTimer({ id: timerId })
  },
  handleStartClick: function (timerId) {
    this.startTimer(timerId);
  },
  handleStopClick: function (timerId) {
    this.stopTimer(timerId);
  },
  startTimer: function (timerId) {
    const now = Date.now();

    this.setState({
      timers: this.state.timers.map( timer => {
        if (timer.id === timerId) {
          return Object.assign({}, timer, {
            runningSince: now
          });
        } else {
          return timer;
        }
      })
    })

    client.startTimer({ id: timerId, start: now });
  },
  stopTimer: function (timerId) {
    const now = Date.now();

    this.setState({
      timers: this.state.timers.map( timer => {
        if (timer.id === timerId) {
          const lastElapsed = now - timer.runningSince;

          return Object.assign({}, timer, {
            elapsed: timer.elapsed + lastElapsed,
            runningSince: null
          });
        } else {
          return timer;
        }
      })
    })

    client.stopTimer({ id: timerId, stop: now });
  },
  render: function () {
    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <EditableTimerList
            timers={this.state.timers}
            onFormSubmit={this.handleEditFormSubmit}
            onDeleteClick={this.handleDeleteClick}
            onStartClick={this.handleStartClick}
            onStopClick={this.handleStopClick}
          />
          <ToggleableTimerForm
            onFormSubmit={this.handleCreateFormSubmit}
          />
        </div>
      </div>
    );
  },
});

const EditableTimerList = React.createClass({
  render: function () {
    const timers = this.props.timers.map( timer => (
        <EditableTimer
          key={timer.id}
          id={timer.id}
          title={timer.title}
          project={timer.project}
          elapsed={timer.elapsed}
          runningSince={timer.runningSince}
          onFormSubmit={this.props.onFormSubmit}
          handleDeleteClick={this.props.onDeleteClick}
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick}
        />
      ));
      return (
        <div id='timers'>
          {timers}
        </div>
      )
  }
});
const EditableTimer = React.createClass({
  getInitialState: function () {
    return {
      editFormOpen: false
    };
  },
  handleEditClick: function () {
    this.openForm();
  },
  handleDeleteClick: function () {
    this.props.handleDeleteClick(this.props.id);
  },
  handleFormClose: function () {
    this.closeForm();
  },
  handleSubmit: function (timer) {
    this.props.onFormSubmit(timer);
    this.closeForm();
  },
  closeForm: function () {
    this.setState({ editFormOpen: false });
  },
  openForm: function () {
    this.setState({ editFormOpen: true });
  },
  render: function () {
    if (this.state.editFormOpen) {
      return (
        <TimerForm
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          onFormSubmit={this.handleSubmit}
          onFormClose={this.handleFormClose}
        />
      );
    } else {
      return (
        <Timer
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onEditClick={this.handleEditClick}
          onDeleteClick={this.handleDeleteClick}l
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick}
        />
      )
    };
  },
});
const ToggleableTimerForm = React.createClass({
  getInitialState: function () {
    return {
      isOpen: false,
    };
  },
  handleFormOpen: function () {
    this.setState({ isOpen: true });
  },
  handleFormClose: function () {
    this.setState({ isOpen: false });
  },
  handleFormSubmit: function (timer) {
    this.props.onFormSubmit(timer);
    this.setState({ isOpen: false })
  },
  render: function () {
    if (this.state.isOpen) {
      return (
        <TimerForm
          onFormSubmit={this.handleFormSubmit}
          onFormClose={this.handleFormClose}
        />
      );
    } else {
      return (
        <div className='ui basic content center aligned segment'>
          <button className='ui basic button icon'
                  onClick={this.handleFormOpen}
          >
            <i className='plus icon'></i>
          </button>
        </div>
      )
    }
  },
});
const TimerForm = React.createClass({
  handleSubmit: function () {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.refs.title.value,
      project: this.refs.project.value,
    });
  },
  render: function () {
    const submitText = this.props.id ? 'Update' : 'Create';
      return (
        <div className='ui centered card'>
          <div className='content'>
            <div className='ui form'>
              <div className='field'>
                <label>Title</label>
                <input type='text' ref='title' defaultValue={this.props.title} />
                <div className='field'>
                  <label>Project</label>
                  <input type='text' ref='project' defaultValue={this.props.project} />
                </div>
                <div className='ui two bottom attached buttons'>
                  <button className='ui basic blue button' onClick={this.handleSubmit}>{submitText}</button>
                  <button className='ui basic red button' onClick={this.props.onFormClose}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  },
});
const Timer = React.createClass({
  getInitialState: function () {
    return {
      showButtons: false
    }
  },
  componentDidMount: function () {
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
  },
  componentWillUnmount: function () {
    clearInterval(this.forceUpdateInterval);
  },
  handleStartClick: function () {
    this.props.onStartClick(this.props.id);
  },
  handleStopClick: function () {
    this.props.onStopClick(this.props.id);
  },
  onMouseEnter: function () {
    this.showButtons();
  },
  onMouseLeave: function () {
    this.hideButtons();
  },
  showButtons: function () {
    this.setState({
      showButtons: true
    })
  },
  hideButtons: function () {
    this.setState({
      showButtons: false
    })
  },
  render: function () {
    const elapsedString = helpers.renderElapsedString(this.props.elapsed, this.props.runningSince);
      return (
      <div className='ui centered card' onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <div className='meta'>
            {this.props.project}
          </div>
          <div className='center aligned description'>
            <h2>{elapsedString}</h2>
          </div>
          <EditDeleteButtons
          onEditClick={this.props.onEditClick}
          onDeleteClick={this.props.onDeleteClick}
          showButtons={this.state.showButtons}
          />
        </div>
        <TimerActionButton
          timerIsRunning={!!this.props.runningSince}
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopClick}
        />
      </div>
    )
  }
});
const EditDeleteButtons = React.createClass({
  render: function () {
    if (this.props.showButtons) {
      return (
        <div className='extra content'>
          <span className='right floated edit icon' onClick={this.props.onEditClick}>
            <i className='edit icon'></i>
          </span>
          <span className='right floated trash icon' onClick={this.props.onDeleteClick}>
            <i className='trash icon'></i>
          </span>
        </div>
      )
    } else {
      return null;
    }
  }
});
const TimerActionButton = React.createClass({
  render: function () {
    if (this.props.timerIsRunning) {
      return (
        <div className='ui bottom attached red basic button' onClick={this.props.onStopClick}>
          Stop
        </div>
      );
    } else {
      return (
        <div className='ui bottom attached red basic button' onClick={this.props.onStartClick}>
          Start
        </div>
      )
    }
  }
})
ReactDOM.render(
  <TimersDashboard />,
  document.getElementById('content')
)
