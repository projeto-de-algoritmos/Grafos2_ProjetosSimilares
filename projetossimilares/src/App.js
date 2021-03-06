import { useState } from 'react';
import './App.css';
import constructBipartiteGraph from './utils/constructBipartiteGraph';
import axios from 'axios';
import Loader from './components/Loader';

function App() {

  let repos = [];
  const [inicialDate, setInicialDate] = useState('');
  const [finalDate, setFinalDate] = useState('');
  const [organization, setOrganization] = useState('');
  const [githubToken, setGithubToken] = useState('');

  async function fetchData(e) {
    e.preventDefault();
    const button = document.getElementById("gerar");
    button.toggleAttribute("disabled");
    const loader = document.getElementById("loader");
    loader.classList.toggle("invisible");
    let response;
    if(!githubToken){
      response = await axios.get(`https://api.github.com/orgs/${organization}/repos?per_page=100`);
    }
    else {
      const auth = 'token '.concat(githubToken);
      response = await axios.get(`https://api.github.com/orgs/${organization}/repos?per_page=100`, { headers: { Authorization: auth } });
    }
    let next;
    if (response.headers.link) {
      next = parseData(response.headers.link).next;
    }
    repos = repos.concat(response.data);

    while (next) {
      response = await axios.get(next);
      next = parseData(response.headers.link).next;
      repos = repos.concat(response.data);
    }

    renderRepos();
  }

  function parseData(data) {
    let arrData = data.split("link:")
    data = arrData.length === 2 ? arrData[1] : data;
    let parsed_data = {}

    arrData = data.split(",")

    for (var d of arrData) {
      var linkInfo = /<([^>]+)>;\s+rel="([^"]+)"/ig.exec(d)

      parsed_data[linkInfo[2]] = linkInfo[1]
    }

    return parsed_data;
  }

  async function renderRepos() {
    let filteredRepos;
    let languages;
    let mappedRepos = [];
    if (inicialDate && finalDate) {
      filteredRepos = repos.filter(repo => {
        const createdAt = repo["created_at"].slice(0, 10);
        if (createdAt >= inicialDate && createdAt <= finalDate) {
          return true;
        }
        return false;
      });
    }
    else{
      filteredRepos = repos;
    }
    for (let repo of filteredRepos) {
      let response;
      if(!githubToken){
        response = await axios.get(repo.languages_url);
      }
      else{
        const auth = 'token '.concat(githubToken);
        response = await axios.get(repo.languages_url, { headers: { Authorization: auth } });
      }
      languages = Object.keys(response.data);
      mappedRepos.push({name: repo.name, languages: languages})
    }
    constructBipartiteGraph(mappedRepos);
  }

  return (
    <div className="App">
      <div className="form-container">
        <form>
          <div className="forminput">
            <label htmlFor="organization">Nome exato da organização:</label>
            <input
              type="text"
              name="organization"
              id="organization"
              placeholder="Nome da Organização"
              value={organization}
              onChange={(e) => { setOrganization(e.target.value) }}
            />
          </div>
          <div className="forminput">
            <label htmlFor="inicialDate">Data inicial:</label>
            <input
              type="date"
              name="inicialDate"
              id="inicialDate"
              placeholder="Data inicial"
              value={inicialDate}
              onChange={(e) => { setInicialDate(e.target.value) }}
            />
          </div>

          <div className="forminput">
            <label htmlFor="finalDate">Data final:</label>
            <input
              type="date"
              name="finalDate"
              id="finalDate"
              placeholder="Data final"
              value={finalDate}
              onChange={(e) => { setFinalDate(e.target.value) }}
            />
          </div>
          <div className="forminput">
            <label htmlFor="githubToken">Token de acesso do Github:</label>
            <input
              type="password"
              name="githubToken"
              id="githubToken"
              placeholder="Token do Github (Opcional)"
              value={githubToken}
              onChange={(e) => { setGithubToken(e.target.value) }}
            />
            <p>Máx. Repositórios sem Token: 60</p>
            <p>Máx. Repositórios com Token: 5000</p>
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/settings/tokens">Crie seu token aqui.</a>
          </div>

          <button id="gerar" type="submit" disabled={false} onClick={fetchData}>Gerar MST</button>
        </form>
      </div>
      <Loader/>
      <div id="cy"></div>
    </div>
  );
}

export default App;
