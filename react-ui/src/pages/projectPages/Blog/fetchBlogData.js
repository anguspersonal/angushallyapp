export const fetchBlogList = async () => {
    try {
      const response = await fetch("/api/db/posts?columns=id,title,slug,excerpt");
      if (!response.ok) throw new Error("Failed to fetch blog list");
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching blog list:", error);
      return [];
    }
  };
  
  export const fetchBlogPost = async (slug) => {
    try {
      const response = await fetch(`/api/db/posts?columns=id,title,content,created_at&slug=${slug}`);
      if (!response.ok) throw new Error("Post not found");
  
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("❌ Error fetching blog post:", error);
      return null;
    }
  };
  