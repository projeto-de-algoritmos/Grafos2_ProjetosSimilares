import renderGraph from './renderGraph';
import constructGraph from './constructGraph';

function compareName(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function compareValue(a, b) {
  if (a.value < b.value) {
    return -1;
  }
  if (a.value > b.value) {
    return 1;
  }
  return 0;
}

// Primeiro, criamos um grafo bipartido de repositorios e linguagens
const adjListLanguages = new Map();
const adjListRepos = new Map();

function addNode(repo) {
  adjListRepos.set(repo.name, []);
  for (let language of repo.languages) {
    if(!adjListLanguages.get(language)){
      adjListLanguages.set(language, []);
    }
    addEdge(repo.name, language);
  }
}

function addEdge(origin, destination) {
  adjListRepos.get(origin).push(destination);
  adjListLanguages.get(destination).push(origin);
}

function render() {
  const graphOfLanguages = Array.from(adjListLanguages, ([name, value]) => ({ name, value })).sort(compareName);
  const graphOfRepos = Array.from(adjListRepos, ([name, value]) => ({ name, value })).sort(compareValue);
  let edgesArray = [];
  const languagesNodes = graphOfLanguages
    .filter(repo => repo.name)
    .map(repo => { return { data: { id: repo.name }, style: { 'background-color': '#531e5e' } } });

  const reposNodes = graphOfRepos
    .map(repo => { return { data: { id: repo.name } } });

  graphOfRepos
    .filter(repo => repo.value[0] !== null)
    .forEach(repo => {
      edgesArray = edgesArray.concat((
        repo.value.map(language => {
          return {
            data: {
              id: `${repo.name}-${language}`,
              source: repo.name,
              target: language
            }
          }
        })
      ));
      
    })

  const elements = [...languagesNodes, ...reposNodes, ...edgesArray];
  renderGraph({ elements });
}

function constructBipartiteGraph(arrayOfRepos) {
  arrayOfRepos.forEach(addNode);
  constructGraph({adjListLanguages, adjListRepos});
}

export default constructBipartiteGraph;