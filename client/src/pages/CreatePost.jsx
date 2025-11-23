import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { postService, categoryService } from '../services/api'

export default function CreatePost() {
  const [formData, setFormData] = useState({
    title: '', content: '', excerpt: '', category: '', tags: '', isPublished: true
  })
  const [image, setImage] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  useEffect(() => {
    categoryService.getAllCategories().then(res => setCategories(res))
    if (isEdit) {
      postService.getPost(id).then(post => {
        setFormData({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          category: post.category._id,
          tags: post.tags?.join(', ') || '',
          isPublished: post.isPublished
        })
      })
    }
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (image) data.append('featuredImage', image)

    try {
      if (isEdit) {
        await postService.updatePost(id, data)
      } else {
        await postService.createPost(data)
      }
      navigate('/')
    } catch (err) {
      alert('Error saving post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{isEdit ? 'Edit' : 'Write New'} Post</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <input
          type="text"
          placeholder="Post Title"
          required
          className="w-full text-3xl border-b-2 pb-2 outline-none"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
        <textarea
          placeholder="Write your content here..."
          required
          rows="15"
          className="w-full p-4 border rounded-lg"
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Short excerpt (optional)"
            className="p-3 border rounded"
            value={formData.excerpt}
            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
          />
          <select
            className="p-3 border rounded"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Tags (comma separated)"
          className="w-full p-3 border rounded"
          value={formData.tags}
          onChange={e => setFormData({ ...formData, tags: e.target.value })}
        />
        <div>
          <label>Featured Image:</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="mt-2" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}
        </button>
      </form>
    </div>
  )
}