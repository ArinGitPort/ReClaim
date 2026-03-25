import { Search, MapPin, Calendar, Tag, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"

interface GalleryFiltersProps {
  filters: {
    search: string;
    dateLost: string;
    categories: string[];
    location: string;
  };
  setFilters: (filters: {
    search: string;
    dateLost: string;
    categories: string[];
    location: string;
  }) => void;
}

const CATEGORIES = ["Electronics", "Wallets & IDs", "Clothing & Accessories", "Bags & Backpacks", "Everyday Items"];

export function GalleryFilters({ filters, setFilters }: GalleryFiltersProps) {
  const handleCategoryToggle = (cat: string) => {
    const newCategories = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    setFilters({ ...filters, categories: newCategories });
  };

  const handleClear = () => {
    setFilters({
      search: "",
      dateLost: "any",
      categories: [],
      location: "all"
    });
  };

  const containerStyles: React.CSSProperties = {
    width: '18rem',
    flexShrink: 0,
    position: 'sticky',
    top: '2rem',
    alignSelf: 'start',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    backgroundColor: '#F8FAFC',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  }

  const sectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  }

  const inputStyles: React.CSSProperties = {
    width: '100%',
    height: '2.5rem',
    padding: '0 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#F1F5F9',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    borderRadius: '0.5rem',
    outline: 'none',
    color: '#0F172A',
  }

  return (
    <div style={containerStyles}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', paddingBottom: '1rem' }}>
        <SlidersHorizontal style={{ width: '1.25rem', height: '1.25rem', color: '#0F172A' }} />
        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Filters</h2>
      </div>

      <div style={sectionStyles}>
        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
          Quick Search
        </label>
        <div style={{ position: 'relative' }}>
          <Input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="e.g. Black laptop, keys..."
            style={{ ...inputStyles, paddingRight: '2.5rem' }}
          />
          {filters.search && (
            <button 
              onClick={() => setFilters({ ...filters, search: "" })}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', zIndex: 10 }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          )}
        </div>
      </div>

      <div style={sectionStyles}>
        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
          Date Lost
        </label>
        <Select 
          value={filters.dateLost}
          onChange={(e) => setFilters({ ...filters, dateLost: e.target.value })}
          style={inputStyles}
        >
          <option value="any">Any Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </Select>
      </div>

      <div style={sectionStyles}>
        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
          Category
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {CATEGORIES.map((cat) => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={filters.categories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
                style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', border: '1px solid #E2E8F0', cursor: 'pointer' }} 
              />
              <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={sectionStyles}>
        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
          Campus Location
        </label>
        <Select 
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          style={inputStyles}
        >
          <option value="all">Everywhere</option>
          <option value="library">Main Library</option>
          <option value="student_union">Student Union</option>
          <option value="gym">Gymnasium</option>
        </Select>
      </div>

      <button 
        onClick={handleClear}
        style={{ 
          width: '100%', 
          padding: '0.625rem 0', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: '#64748B', 
          backgroundColor: '#F1F5F9', 
          borderRadius: '0.5rem', 
          border: '1px solid rgba(226, 232, 240, 0.5)', 
          cursor: 'pointer' 
        }}
      >
        Clear All Filters
      </button>
    </div>
  )
}
