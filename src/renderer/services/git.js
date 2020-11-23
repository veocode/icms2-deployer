class GitService {

    getRepoUrlWithCredentials(repoUrl, user, password) {
        let urlParts = repoUrl.split('https://');
        let url = urlParts[1];
        return `https://${user}:${password}@${url}`;
    }

}

module.exports = new GitService();
