module.exports = {
    icms2dockerRepoUrl: 'https://github.com/veocode/icms2-docker.git',
    serverSiteRoot: '/opt',
    config: {
        dir: '.icms2deployer',
        file: 'config.json',
        isEncrypt: false
    },
    defaultSite: {
        name: '',
        url: '',
        localDir: '',
        version: '1.0.0',
        git: {
            repo: 'https://github.com/veocode/testrepo.git',
            user: 'veocode',
            password: '',
            dsn: null
        },
        server: {
            host: '134.209.26.140',
            port: '22',
            user: 'root',
            password: '',
            dir: ''
        },
        deploy: {
            done: false,
            date: null,
        },
        update: {
            done: false,
            date: null,
        },
        cert: {
            done: false,
            date: null,
            email: '',
            domain: ''
        },
        config: {
            HTTP_PORT: 80,
            PHPMYADMIN_PORT: 8080,
            MYSQL_DATABASE: 'icmsdb',
            MYSQL_USER: 'icmsdb',
            MYSQL_PASSWORD: 'secret',
            MYSQL_ROOT_PASSWORD: 'rootsecret',
            PHPMYADMIN_INSTALL: 'y'
        }
    },
};
