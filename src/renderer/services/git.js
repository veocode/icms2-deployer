class GitService {

    getRepoDSN(credentials) {
        let { repo, user, password } = credentials;
        let urlParts = repo.split('https://');
        let url = urlParts[1];
        return `https://${user}:${password}@${url}`;
    }

}

module.exports = new GitService();
