"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const noImage = 'https://tinyurl.com/tv-missing'
const $episodeList = $('#episodes-list');

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  return res.data;
};


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  for (let show of shows) {
    if (show.show.image === null) {
      show.show.image = noImage;
    } else {
      show.show.image = show.show.image.medium;
    };
    if (show.show.summary === null) {
      show.show.summary = 'No summary available';
    }

    const $show = $(
      `<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.show.image}"
              alt="${show.show.name}" 
              class="w-25 mr-3 card-img-top">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${show.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    const $episodeBtn = $(`<button class="episode-btn">Episodes</button>`);
    $showsList.append($show)
    $(`[data-show-id=${show.show.id}]`).append($episodeBtn);

  };

  $('.episode-btn').on('click', function () {
    const showId = $(this).parent().data('show-id')
    getEpisodesOfShow(showId);
  });
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }
async function getEpisodesOfShow(id) {
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  let episodes = [];
  for (let {
      id,
      name,
      season,
      number
    } of res.data) {
    episodes.push({
      id,
      name,
      season,
      number
    });
  }
  return populateEpisodes(episodes, id);
}

/** Write a clear docstring for this function... */

//when episodes are available, display the episode data under the show data
function populateEpisodes(episodes, id) {
  $(`[data-show-id=${id}]`).find('li').remove();
  if (episodes.length <= 0) {
    const $noEpisode = $(`<li>No episode available</li>`);
    $(`[data-show-id=${id}]`).append($noEpisode);

  } else {
    for (let episode of episodes) {
      const $episodeInfo = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
      $(`[data-show-id=${id}]`).append($episodeInfo);
    }
  }
}