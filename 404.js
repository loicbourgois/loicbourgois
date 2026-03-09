import { 
    search
 } from "./movie-finder/search.js"

 import { 
    get
 } from "./movie-finder/get.js"

const main = async () => {
  console.log("404")
  const parts = window.location.pathname.split("/");
  if (parts[1] === "movie-finder" && parts.length == 3) {
    get(parts[2])
  }
  if (parts[1] === "movie-finder" && parts[2] === "search" && parts.length == 4) {
    search(parts[3])
  }
}
main()