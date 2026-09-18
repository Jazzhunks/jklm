import re

with open("frontend/src/pages/Home.jsx", "r") as f:
    text = f.read()

# Add useQuery import
if "import { useQuery }" not in text:
    text = text.replace('import { useEffect, useState } from "react";', 'import { useEffect, useState } from "react";\nimport { useQuery } from "@tanstack/react-query";')

old_state_block = """  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ students_trained: 1323, selections: 100, educators: 100, centers: 5 });
  const [results, setResults] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [centers, setCenters] = useState([]);
  
  // WATH State
  const [wathPage, setWathPage] = useState(null);
  const [wathLoading, setWathLoading] = useState(true);

  useEffect(() => {
    const toList = (d) => (Array.isArray(d) ? d : d?.items || []);
    Promise.all([
      api.get("/courses?featured=true").then(r => setCourses(toList(r.data))).catch(()=>{}),
      api.get("/stats").then(r => {
        // Destructure 'centers' out so the backend stats can NEVER overwrite it
        const { centers: _, ...statsWithoutCenters } = r.data || {};
        setStats(prev => ({ ...prev, ...statsWithoutCenters }));
      }).catch(()=>{}),
      api.get("/results").then(r => setResults(toList(r.data).slice(0, 6))).catch(()=>{}),
      api.get("/testimonials").then(r => setTestimonials(toList(r.data))).catch(()=>{}),
      api.get("/centers").then(r => {
        const list = toList(r.data);
        setCenters(list);
        // Explicitly set the accurate count from the array length
        setStats(prev => ({ ...prev, centers: list.length }));
      }).catch(()=>{}),
      api.get("/wath/page")
        .then(r => {
          if (r.data?.enabled) setWathPage(r.data);
        })
        .catch(() => {})
        .finally(() => setWathLoading(false))
    ]);
  }, []);"""

new_query_block = """  const toList = (d) => (Array.isArray(d) ? d : d?.items || []);

  const { data: courses = [] } = useQuery({
    queryKey: ['home_courses'],
    queryFn: () => api.get("/courses?featured=true").then(r => toList(r.data)),
    staleTime: 5 * 60 * 1000,
  });

  const { data: centers = [] } = useQuery({
    queryKey: ['home_centers'],
    queryFn: () => api.get("/centers").then(r => toList(r.data)),
    staleTime: 5 * 60 * 1000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['home_stats'],
    queryFn: () => api.get("/stats").then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: results = [] } = useQuery({
    queryKey: ['home_results'],
    queryFn: () => api.get("/results").then(r => toList(r.data).slice(0, 6)),
    staleTime: 5 * 60 * 1000,
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['home_testimonials'],
    queryFn: () => api.get("/testimonials").then(r => toList(r.data)),
    staleTime: 5 * 60 * 1000,
  });

  const { data: wathPage, isLoading: wathLoading } = useQuery({
    queryKey: ['home_wath'],
    queryFn: () => api.get("/wath/page").then(r => r.data?.enabled ? r.data : null),
    staleTime: 5 * 60 * 1000,
  });

  const defaultStats = { students_trained: 1323, selections: 100, educators: 100, centers: 5 };
  const stats = { ...defaultStats, ...(statsData || {}), centers: centers.length || 5 };
"""

text = text.replace(old_state_block, new_query_block)

with open("frontend/src/pages/Home.jsx", "w") as f:
    f.write(text)

