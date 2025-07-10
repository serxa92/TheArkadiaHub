
// Función auxiliar para dar formato a fechas YYYY-MM-DD
const getFormattedDate = (date) => date.toISOString().split("T")[0];

// Funciones y URLs de filtros
export const filters = (ordering) => ({
  best: `https://api.rawg.io/api/games?dates=2025-01-01,2025-12-31`,
  popular: `https://api.rawg.io/api/games?ordering=-added`,
  top: `https://api.rawg.io/api/games?ordering=-added`,
  pc: `https://api.rawg.io/api/games?platforms=4`,
  ps: `https://api.rawg.io/api/games?platforms=18,187`,
  xbox: `https://api.rawg.io/api/games?platforms=1`,
  switch: `https://api.rawg.io/api/games?platforms=7`,
  action: `https://api.rawg.io/api/games?genres=action`,
  rpg: `https://api.rawg.io/api/games?genres=role-playing-games-rpg`,
  shooter: `https://api.rawg.io/api/games?genres=shooter`,
  strategy: `https://api.rawg.io/api/games?genres=strategy`,
  adventure: `https://api.rawg.io/api/games?genres=adventure`,
  racing: `https://api.rawg.io/api/games?genres=racing`,
  sports: `https://api.rawg.io/api/games?genres=sports`,
  puzzle: `https://api.rawg.io/api/games?genres=puzzle`,
  free: `https://api.rawg.io/api/games?tags=free-to-play`,
  calendar: `https://api.rawg.io/api/games?dates=2025-06-01,2025-12-31`,


  thisWeek: () => {
    const today = new Date();
    const start = new Date(today.setDate(today.getDate() - today.getDay()));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `https://api.rawg.io/api/games?dates=${getFormattedDate(
      start
    )},${getFormattedDate(end)}&ordering=${ordering}`;
  },

  last30: () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    return `https://api.rawg.io/api/games?dates=${getFormattedDate(
      lastMonth
    )},${getFormattedDate(today)}&ordering=${ordering}`;
  },

  nextWeek: () => {
    const today = new Date();
    const nextMonday = new Date(
      today.setDate(today.getDate() + (8 - today.getDay()))
    );
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    return `https://api.rawg.io/api/games?dates=${getFormattedDate(
      nextMonday
    )},${getFormattedDate(nextSunday)}&ordering=${ordering}`;
  },
});


