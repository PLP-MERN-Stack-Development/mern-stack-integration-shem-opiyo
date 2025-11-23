import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { postService, authService } from '../services/api'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState('')
  const user = authService.getCurrentUser()

  useEffect(() => {
    postService.getPost(id).then(setPost)
  }, [id])

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    await postService.addComment(id, { content: comment })
    setComment('')
    postService.getPost(id).then(setPost)
  }

  if (!post) return <p className="text-center text-2xl">Loading...</p>

  return (
    <div className="max-w-4xl mx-auto">
      {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
        <img src={`http://localhost:5000${post.featuredImage}`} alt={post.title} className="w-full h-96 object-cover rounded-lg" />
      )}
      <h1 className="text-5xl font-bold my-6">{post.title}</h1>
      <p className="text-gray-600 mb-8">
        by {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <div className="prose max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }} />

      {user && (
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Add a Comment</h3>
          <form onSubmit={handleComment} className="flex gap-4">
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your comment..."
              className="flex-1 p-3 border rounded"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
              Post Comment
            </button>
          </form>
        </div>
      )}

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6">{post.comments.length} Comments</h3>
        {post.comments.map(c => (
          <div key={c._id} className="bg-white p-4 rounded shadow mb-4">
            <p className="font-semibold">{c.user?.name || 'Anonymous'}</p>
            <p>{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}