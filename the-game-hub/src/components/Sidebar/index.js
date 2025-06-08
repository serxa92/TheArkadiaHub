import "./styles.css";

export function Sidebar() {
  return `
    <nav class="sidebar-nav">
      <ul>  
        <li class="section-title">Home</li>

        <li><a href="#reviews"><i class="fa-regular fa-star fa-lg "></i> Reviews</a></li>

        <li class="section-title">New Releases</li>

        <li><a href="#last30"><i class="fa-regular fa-star fa-lg"></i> Last 30 days</a></li>
        <li><a href="#thisweek"><i class="fa-solid fa-fire fa-lg"></i> This week</a></li>
        <li><a href="#nextweek"><i class="fa-solid fa-forward-fast fa-lg"></i> Next week</a></li>
        <li><a href="#calendar"><i class="fa-solid fa-calendar-days fa-lg"></i> Release calendar</a></li>

        <li class="section-title">Top</li>
        <li><a href="#top-year"><i class="fa-solid fa-trophy fa-lg"></i> Best of the year</a></li>
        <li><a href="#popular"><i class="fa-solid fa-chart-line fa-lg"></i> Popular</a></li>

        <li class="section-title">Platforms</li>
        <li><a href="#pc"><i class="fa-brands fa-windows fa-lg"></i> PC</a></li>
        <li><a href="#ps4"><i class="fa-brands fa-playstation fa-lg"></i> PS4</a></li>
        <li><a href="#xbox"><i class="fa-brands fa-xbox fa-lg"></i> Xbox One</a></li>

        <li class="section-title">Genres</li>
        <li> <a href = "">Free Online Games</a></li>
        <li> <a href = "">Action</a></li>
        <li> <a href = "">RPG</a></li>
        <li> <a href = "">Shooter</a></li>
        <li> <a href = "">Strategy</a></li>
        <li> <a href = "">Adventure</a></li>
        <li> <a href = "">Racing</a></li>
        <li> <a href = "">Sports</a></li>
        <li> <a href = "">Puzzle</a></li>
        

      </select>
    </div>
      </ul>
    </nav>
  `;
}
