import React, { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  username: string;
  gameType: 'Competitive' | 'Casual';
}

export const ProfileManager = () => {
  const [username, setUsername] = useState('');
  const [gameType, setGameType] = useState<'Competitive' | 'Casual'>('Competitive');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('game_dna_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setProfiles(parsed);
      } catch (e) {
        console.warn('ProfileManager: invalid saved profiles, clearing localStorage', e);
        localStorage.removeItem('game_dna_profiles');
      }
    }
  }, []);

  const handleCreateProfile = () => {
    if (!username.trim()) return alert("Username daxil edin!");
    const newProfile: UserProfile = { id: Date.now().toString(), username, gameType };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('game_dna_profiles', JSON.stringify(updated));
    setUsername('');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px 0' }}>
      <h3>Hesab və Lokal Profillər</h3>
      <div style={{ marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Username yazın..." 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <select value={gameType} onChange={(e) => setGameType(e.target.value as any)} style={{ padding: '5px', marginRight: '10px' }}>
          <option value="Competitive">Rəqabətli (Competitive)</option>
          <option value="Casual">Rahat (Casual)</option>
        </select>
        <button onClick={handleCreateProfile} style={{ padding: '5px 10px', cursor: 'pointer' }}>Profil Əlavə Et</button>
      </div>
      <h4>Yadda saxlanılan profillər:</h4>
      <ul>
        {profiles.map(p => <li key={p.id}><strong>{p.username}</strong> — {p.gameType} Modu</li>)}
      </ul>
    </div>
  );
};