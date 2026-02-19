import { 
    search
 } from "./movie-finder/search.js"

const main = async () => {
  console.log("404")
  const parts = window.location.pathname.split("/");
  if (parts[1] === "movie-finder") {
    search(parts[2])
  }
}
main()