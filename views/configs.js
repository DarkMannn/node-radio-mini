const boxChildCommonConfig = {
    width: '100%',
    height: 1,
    left: 0
};

const Configs = {
    playlist: {
        bgFocus: 'black',
        bgPlain: 'green',
        config: {
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            scrollable: true,
            label: 'Playlist',
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'green',
                border: {
                    fg: '#f0f0f0'
                }
            }
        },
        childConfig: {
            ...boxChildCommonConfig,
            fg: 'white',
            bg: 'green'
        }
    },
    queue: {
        bgFocus: 'black',
        bgPlain: 'blue',
        config: {
            top: 0,
            left: '50%',
            width: '50%',
            height: '70%',
            scrollable: true,
            label: 'Queue',
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'blue',
                border: {
                    fg: '#f0f0f0'
                }
            }
        },
        childConfig: {
            ...boxChildCommonConfig,
            fg: 'white',
            bg: 'blue'
        }
    },
    nowPlaying: {
        config: {
            top: '70%',
            left: '50%',
            width: '50%',
            height: 3,
            label: 'Now Playing',
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: '#f0f0f0'
                }
            }
        },
        childConfig: {
            ...boxChildCommonConfig,
            fg: 'green',
            bg: 'black'
        }
    },
    controls: {
        config: {
            top: '85%',
            left: '50%',
            width: '50%',
            height: 5,
            scrollable: true,
            label: 'Controls',
            border: {
                type: 'line'
            },
            style: {
                fg: 'grey',
                bg: 'black',
                border: {
                    fg: '#000000'
                }
            }
        }
    }
};

module.exports = Configs;
