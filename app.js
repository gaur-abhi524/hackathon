//scroll animations

let leftimg=document.getElementById("left-img");
let midimg=document.getElementById("mid-img");
let rightimg=document.getElementById("right-img");

window.addEventListener('scroll',function(){
    let value=window.scrollY;
    leftimg.style.left = -value*0.3 + 'px';
    rightimg.style.left=value*0.3+'px';
    midimg.style.top=value+'px';
})

//api functionality
const clientid="dd0c922c8bf9407b94ffcd9bd5beb7ef";
const clientsecret="de7c99312b284fcd85840966acfa308f";

const gettoken = async()=>{
    const result=await fetch('https://accounts.spotify.com/api/token',{
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + btoa(clientid + ':' + clientsecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data=await result.json();
    return data.access_token;
}

const _getGenres = async (token) => {

    const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
    return data.categories.items;
}

const _getPlaylistByGenre = async (token, genreId) => {

    const limit = 10;
    
    const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
    return data.playlists.items;
}

const _getTracks = async (token, tracksEndPoint) => {

    const limit = 10;

    const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
    return data.items;
}

const _getTrack = async (token, trackEndPoint) => {

    const result = await fetch(`${trackEndPoint}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
    console.log(data);
    return data;
}

// code for populating web page

const genre=document.getElementById('select-genre');
const playlist=document.getElementById('select-playlist');
const song_list=document.getElementById('song-list');
const song_detail=document.getElementById('song-detail');
const hiddentoken=document.getElementById('hidden_token');
const submit_btn=document.getElementById('genre-submit')

function createGenre(text, value,param=genre) {
    const html = `<option value="${value}">${text}</option>`;
    param.insertAdjacentHTML('beforeend', html);
}

function createPlaylist(text, value,param=playlist) {
    const html = `<option value="${value}">${text}</option>`;
    param.insertAdjacentHTML('beforeend', html);
}

function createTrack(id, name,param=song_list) {
    const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a><br>`;
    param.insertAdjacentHTML('beforeend', html);
}

function createTrackDetail(img, title, artist,param=song_detail) {

    const detailDiv = param;
    detailDiv.innerHTML = '';

    const html = 
    `
    <div>
        <img src="${img}" alt="">        
    </div>
    <div>
        <label for="Genre">${title}:</label>
    </div>
    <div>
        <label for="artist" >By ${artist}:</label>
    </div> 
    `;

    detailDiv.insertAdjacentHTML('beforeend', html)
}

function resetTrackDetail(param=song_detail) {
    param.innerHTML = '';
}

function resetTracks(param=song_list) {
    param.innerHTML = '';
    resetTrackDetail();
}

function resetPlaylist(param=playlist) {
    param.innerHTML = '';
    resetTracks();
}

function storeToken(value) {
    hiddentoken.value = value;
}

function getStoredToken() {
    return {
        token: hiddentoken.value
    }
}

const controller=function(){
    
    const loadgenre = async() =>
    {
        const token= await gettoken();
        storeToken(token);
        const genres=await _getGenres(token);
        genres.forEach(element => createGenre(element.name, element.id));
        console.log(token);
    }
    genre.addEventListener('change', async()=>{
        resetPlaylist();
        const token=getStoredToken().token;
        const genreId= genre.options[genre.selectedIndex].value;
        const playlist=await _getPlaylistByGenre(token,genreId);
        playlist.forEach(element => createPlaylist(element.name, element.tracks.href));
    });
    submit_btn.addEventListener('click',async(e)=>{
        e.preventDefault();
        resetTracks();
        const token=getStoredToken().token;
        const trackEndPoint=playlist.options[playlist.selectedIndex].value;
        const tracks= await _getTracks(token,trackEndPoint);
        tracks.forEach(element => createTrack(element.track.href, element.track.name));
    });
    song_list.addEventListener('click',async(e) => {
        e.preventDefault();
        resetTrackDetail();
        const token=getStoredToken().token;
        const trackEndPoint=e.target.id;
        const track=await _getTrack(token, trackEndPoint);
        createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
    })
    loadgenre();
};
controller()
// search functionality

const search = async (token, query, type) => {

    const limit = 10;

    const result = await fetch(`https://api.spotify.com/v1/search?q=${query}%20song&type=${type}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
    return data.tracks.items;
}

const q_submit=document.getElementById("query-submit");
const select=document.getElementById("select");
const ssonglist=document.getElementById("ssonglist");
const ssongdetail=document.getElementById("ssongdetail");
const type=document.getElementById("select");

const searcher=function(){

    const tokens = async() =>
    {
        const token= await gettoken();
        storeToken(token);
        console.log(token);
    }

    q_submit.addEventListener('click',async(e) =>{
        e.preventDefault();
        const q=document.getElementById("query").value;
        const token=getStoredToken().token;
        console.log(q);
        const qtype=type.options[type.selectedIndex].value;
        const tracks=await search(token, q, qtype);
        resetTracks(ssonglist);
        tracks.forEach(element => createTrack(element.href, element.name, ssonglist));
    })
    ssonglist.addEventListener('click',async(e) => {
        e.preventDefault();
        resetTrackDetail(ssongdetail);
        const token=getStoredToken().token;
        const trackEndPoint=e.target.id;
        const track=await _getTrack(token, trackEndPoint);
        createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name,ssongdetail);
    })
    tokens();
};
searcher()