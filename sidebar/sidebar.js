function getRoomName(roomId) {
  return null;
}

async function createRoom() {
  if (!this.accessToken) { this.error = 'Not authenticated'; return; }
  if (!this.newRoomName || !this.newRoomName.trim()) return;
  try {
    const res = await fetch('https://matrix.org/_matrix/client/r0/createRoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        preset: 'private_chat',
        name: this.newRoomName.trim(),
      }),
    });
    const data = await res.json();
    if (data && data.room_id) {
      this.newRoomId = data.room_id;
      this.roomId = data.room_id;
      this.messages = [];
      this.lastSyncToken = '';
      this.newRoomName = '';
      await this.fetchRoomsWithNames();
      this.fetchMessages();
      alert(`Room created: ${this.newRoomId}`);
    } else {
      alert('Create room failed: ' + (data.error || 'Unknown error'));
    }
  } catch (e) {
    alert('Create room error: ' + e.message);
  }
}

async function fetchRoomsWithNames() {
  if (!this.accessToken) return;
  try {
    const res = await fetch('https://matrix.org/_matrix/client/r0/joined_rooms', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    });
    const data = await res.json();
    if (data && Array.isArray(data.joined_rooms)) {
      const roomPromises = data.joined_rooms.map(async (roomId) => {
        let name = null;
        try {
          const nameRes = await fetch(
            `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/state/m.room.name`,
            { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
          );
          const nameData = await nameRes.json();
          name = nameData && nameData.name ? nameData.name : (this.getRoomName(roomId) || roomId);
        } catch {
          name = this.getRoomName(roomId) || roomId;
        }
        return { roomId, name };
      });
      const list = await Promise.all(roomPromises);
      this.rooms = list.sort((a, b) => {
        const an = (a.name || a.roomId).toLowerCase();
        const bn = (b.name || b.roomId).toLowerCase();
        if (an < bn) return -1;
        if (an > bn) return 1;
        return a.roomId.localeCompare(b.roomId);
      });
      if (this.rooms.length > 0 && !this.roomId) {
        this.roomId = this.rooms[0].roomId;
      }
    }
  } catch {}
}

function switchRoom(roomId) {
  if (!roomId || this.roomId === roomId) return;
  this.roomId = roomId;
  this.messages = [];
  this.lastSyncToken = '';
  this.fetchMessages();
}

async function fetchMessages() {
  return;
}
