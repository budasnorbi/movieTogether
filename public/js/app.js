const socket = io();
const Element = ElementManager();

Element.create(
    ['upload-container', `<div class="upload"></div>`],
    ['upload-heading', `<h1 class="upload__heading">Movie2gether</h1>`],
    ['upload-label', `<label for="upload-input" class="upload__label">Select a Movie...</label>`],
    ['upload-input', `<input id="upload-input" class="upload__input" type="file" accept="video/mp4">`],
    ['upload-btn', `<button class="upload__btn upload__btn--upload"></button>`],
    ['upload-reload', `<button class="upload__btn upload__btn--reload"><button>`],
    ['upload-progress', '<span class="upload__progress"></span>'],
    ['video',`<video class="movie" controls></video>`]
);

Element.append({
    parent:'upload-container',
    children:['upload-heading', 'upload-label', 'upload-input']
});

document.body.appendChild(Element.get('upload-container'));

Element.get('upload-input').addEventListener('change', event => {
    const fileName = event.target.files[0].name;
    Element.get('upload-label').textContent = fileName;

    Element.append({parent:'upload-container', children:['upload-reload','upload-btn']});
});

Element.get('upload-reload').addEventListener('click', event => {
    Element.get('upload-label').textContent = 'Select a Movie...';
    Element.get('upload-input').value = '';

    Element.remove('upload-reload');
    Element.remove('upload-btn');
});

var uploader = new SocketIOFileUpload(socket);
        uploader.listenOnSubmit(Element.get('upload-btn'), Element.get('upload-input'));

Element.get('upload-btn').addEventListener('click', event => {
    Element.remove('upload-label');
    Element.remove('upload-reload');
    Element.remove('upload-btn');
    Element.append({parent:'upload-container',children:['upload-progress']});
});

socket.on('upload-progress', (data) => {
    console.log(data);
    Element.get('upload-progress').textContent = `${data}%`;
});

socket.on('successed', (bool) => {
    if(bool){
        Element.get('upload-progress').textContent = 'Waiting for video convertation!';
        console.log(bool);
    }
});

socket.on('movieIsPlayable', bool => {
    Element.remove('upload-progress');
    if(bool){
        if(Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource('./../video/converted/movie.m3u8');
            hls.attachMedia(Element.get('video'));
            Element.append({parent:'upload-container',children:['video']});
        }
    }
})

