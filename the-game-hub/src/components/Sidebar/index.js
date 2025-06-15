import "./styles.css";

export function Sidebar() {
  return `
    <nav class="sidebar-nav">
      <ul>  
        <li><a href="#/" class="navlink">Home</a></li>

        <li class="section-title">Releases</li>

        <li><a href="#" id="btn-last30"><i class="fa-regular fa-star fa-lg"></i> Last 30 days</a></li>
        <li><a href="#" id="btn-thisweek"><i class="fa-solid fa-fire fa-lg"></i> This week</a></li>
        <li><a href="#" id="btn-nextweek"><i class="fa-solid fa-forward-fast fa-lg"></i> Next week</a></li>
        <li><a href="#" id="btn-calendar"><i class="fa-solid fa-calendar-days fa-lg"></i> Release calendar</a></li>

        <li class="section-title">Top</li>
        <li><a href="#" id="btn-best"><i class="fa-solid fa-trophy fa-lg"></i> Best of the year</a></li>
        <li><a href="#" id="btn-popular"><i class="fa-solid fa-chart-line fa-lg"></i> Popular</a></li>

        <li class="section-title">Platforms</li>
        <li><a href="#" id="btn-pc"><i class="fa-brands fa-windows fa-lg"></i> PC</a></li>
        <li><a href="#" id="btn-ps"><i class="fa-brands fa-playstation fa-lg"></i> Playstation</a></li>
        <li><a href="#" id="btn-xbox"><i class="fa-brands fa-xbox fa-lg"></i> Xbox One</a></li>

        <li class="section-title">Genres</li>
        <li><a href="#" id="btn-free">Free Online Games</a></li>
        <li><a href="#" id="btn-action">Action</a></li>
        <li><a href="#" id="btn-rpg">RPG</a></li>
        <li><a href="#" id="btn-shooter">Shooter</a></li>
        <li><a href="#" id="btn-strategy">Strategy</a></li>
        <li><a href="#" id="btn-adventure">Adventure</a></li>
        <li><a href="#" id="btn-racing">Racing</a></li>
        <li><a href="#" id="btn-sports">Sports</a></li>
        <li><a href="#" id="btn-puzzle">Puzzle</a></li>
      </ul>
    </nav>
  `;
}
