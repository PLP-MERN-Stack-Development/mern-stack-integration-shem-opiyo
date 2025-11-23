import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { postService, categoryService } from '../services/api'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, catsRes] = await Promise.all([
          postService.getAllPosts(),
          categoryService.getAllCategories()
        ])
        setPosts(postsRes.posts)
        setCategories(catsRes)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-center text-2xl">Loading posts...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h1 className="text-4xl font-bold mb-8">Latest Posts</h1>
        {posts.length === 0 ? (
          <p>No posts yet. Be the first to write one!</p>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white shadow-md rounded-lg p-6 mb-6">
              {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
                <img src={`http://localhost:5000${post.featuredImage}`} alt={post.title} className="w-full h-64 object-cover rounded" />
              )}
              <h2 className="text-2xl font-bold mt-4">
                <Link to={`/posts/${post._id}`} className="text-blue-600 hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 my-2">by {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-700">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
            </div>
          ))
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat._id}>
              <Link to="/" className="text-blue-600 hover:underline">{cat.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}