import React from 'react';
import { useSelector } from "react-redux";
import Posts from '../components/home/Posts';
import Status from '../components/home/Status';
import RightSideBar from "../components/home/RightSideBar";
import LoadIcon from '../images/loading.gif';

const Home = () => {
  const { homePosts } = useSelector(state => state);

  return (
    <div className="home row mx-0">
      <div className="col-md-8">
        <Status />
        {homePosts.loading ? (
          <img src={LoadIcon} alt="loading" className="d-block mx-auto" />
        ) : homePosts.error ? ( // Check if there's an error
          <h2 className="text-center text-danger">Error fetching posts</h2>
        ) : homePosts.result === 0 ? (
          <h2 className="text-center">No Posts</h2>
        ) : (
          <Posts posts={homePosts.data} /> // Pass posts data if necessary
        )}
      </div>

      <div className="col-md-4">
        <RightSideBar />
      </div>
    </div>
  );
}

export default Home;
