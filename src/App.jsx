import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [animeList, setAnimeList] = useState([]);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(1);
  const [newAnimeTitle, setNewAnimeTitle] = useState('');
  const [newAnimeImage, setNewAnimeImage] = useState('');

  const categories = ['Watching', 'Completed', 'Plan to Watch'];

  // Fetch anime from Jikan API whenever page changes
  useEffect(() => {
    fetch(`https://api.jikan.moe/v4/top/anime?limit=20&page=${page}`)
      .then(res => res.json())
      .then(data => {
        const newAnime = data.data.map(anime => ({
          id: anime.mal_id,
          title: anime.title,
          image: anime.images.jpg.large_image_url,
          category: 'Plan to Watch',
          synopsis: anime.synopsis || 'No description available.'
        }));
        // Avoid duplicates by checking existing IDs
        setAnimeList(prev => {
          const existingIds = prev.map(a => a.id);
          const filteredNew = newAnime.filter(a => !existingIds.includes(a.id));
          return [...prev, ...filteredNew];
        });
      })
      .catch(err => console.error(err));
  }, [page]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [darkMode]);

  const moveAnime = (id, newCategory) => {
    setAnimeList(prev =>
      prev.map(anime => (anime.id === id ? { ...anime, category: newCategory } : anime))
    );
  };

  const deleteAnime = id => {
    setAnimeList(prev => prev.filter(a => a.id !== id));
  };

  const addAnime = e => {
    e.preventDefault();
    if (!newAnimeTitle) return;
    const newAnime = {
      id: Date.now(),
      title: newAnimeTitle,
      image: newAnimeImage || 'https://via.placeholder.com/250x350?text=No+Image',
      category: 'Plan to Watch',
      synopsis: 'User added anime.'
    };
    setAnimeList(prev => [newAnime, ...prev]);
    setNewAnimeTitle('');
    setNewAnimeImage('');
  };

  const filteredAnime = animeList.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className='app'>
      <header>
        <h1>🎌 Anime Tracker</h1>
        <button onClick={() => setDarkMode(prev => !prev)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      {/* Add Anime Form */}
      <form className='add-form' onSubmit={addAnime}>
        <input
          type='text'
          placeholder='Anime title'
          value={newAnimeTitle}
          onChange={e => setNewAnimeTitle(e.target.value)}
          required
        />
        <input
          type='text'
          placeholder='Image URL (optional)'
          value={newAnimeImage}
          onChange={e => setNewAnimeImage(e.target.value)}
        />
        <button type='submit'>Add Anime</button>
      </form>

      <input
        type='text'
        placeholder='Search anime...'
        value={search}
        onChange={e => setSearch(e.target.value)}
        className='search-input'
      />

      <main className='categories'>
        {categories.map(cat => {
          const categoryAnime = filteredAnime.filter(a => a.category === cat);
          return (
            <div key={cat} className='category'>
              <h2>{cat}</h2>
              <div className='anime-grid'>
                {categoryAnime.length === 0 && <p>No anime here.</p>}
                {categoryAnime.map(anime => (
                  <div key={anime.id} className='anime-card'>
                    <div className='img-container'>
                      <img src={anime.image} alt={anime.title} />
                    </div>
                    <h3>{anime.title}</h3>
                    <p className='synopsis'>{anime.synopsis}</p>
                    <div className='actions'>
                      {categories.filter(c => c !== anime.category).map(c => (
                        <button key={c} onClick={() => moveAnime(anime.id, c)}>
                          Move to {c}
                        </button>
                      ))}
                      <button className='delete' onClick={() => deleteAnime(anime.id)}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      <div className='load-more'>
        <button onClick={() => setPage(prev => prev + 1)}>Load More Anime</button>
      </div>
    </div>
  );
}