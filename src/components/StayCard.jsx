import { Box, Typography, Chip } from "@mui/material"
import { LocationOn, Star, Pool, Spa, Wifi, Restaurant, FitnessCenter, LocalParking, AcUnit, RoomService, Hotel } from "@mui/icons-material"
import { alpha } from "@mui/material"

// Placeholder hotel images for different styles
const HOTEL_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", // Luxury resort
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", // Hotel pool
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", // Hotel room
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", // Beach resort
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80", // City hotel
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", // Elegant lobby
]

export function StayCard({ stay, onClick }) {
  // Get a consistent placeholder based on hotel name/id
  const getPlaceholderImage = () => {
    const index = stay.name ? stay.name.length % HOTEL_PLACEHOLDERS.length : 0
    return HOTEL_PLACEHOLDERS[index]
  }

  const hotelImage = stay.image || stay.main_image || stay.thumbnail || getPlaceholderImage()

  // Helper function to render amenity icons
  const getAmenityIcon = (amenity) => {
    const amenityLower = (amenity || '').toLowerCase()
    if (amenityLower.includes("pool")) return <Pool sx={{ fontSize: 20 }} />
    if (amenityLower.includes("spa") || amenityLower.includes("wellness")) return <Spa sx={{ fontSize: 20 }} />
    if (amenityLower.includes("wifi") || amenityLower.includes("internet")) return <Wifi sx={{ fontSize: 20 }} />
    if (amenityLower.includes("restaurant") || amenityLower.includes("dining")) return <Restaurant sx={{ fontSize: 20 }} />
    if (amenityLower.includes("gym") || amenityLower.includes("fitness")) return <FitnessCenter sx={{ fontSize: 20 }} />
    if (amenityLower.includes("parking")) return <LocalParking sx={{ fontSize: 20 }} />
    if (amenityLower.includes("air") || amenityLower.includes("ac")) return <AcUnit sx={{ fontSize: 20 }} />
    if (amenityLower.includes("room service")) return <RoomService sx={{ fontSize: 20 }} />
    return <Star sx={{ fontSize: 20 }} />
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "white",
        cursor: "pointer",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid",
        borderColor: alpha("#000", 0.04),
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.18)",
          borderColor: "#ff0080",
          "& .stay-image": {
            transform: "scale(1.1)"
          },
          "& .book-btn": {
            background: "linear-gradient(135deg, #ff0080 0%, #ff4d94 100%)"
          }
        }
      }}
    >
      {/* Image Header */}
      <Box
        sx={{
          position: "relative",
          height: 220,
          overflow: "hidden"
        }}
      >
        {/* Background Image */}
        <Box
          className="stay-image"
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${hotelImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.6s ease",
            bgcolor: "#e0e0e0"
          }}
        >
          {/* Fallback icon if image fails */}
          {!hotelImage && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <Hotel sx={{ fontSize: 64, color: 'white', opacity: 0.7 }} />
            </Box>
          )}
        </Box>

        {/* Overlay Gradient */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0, 45, 104, 0.7) 0%, rgba(255, 0, 128, 0.3) 100%)"
          }}
        />

        {/* Content on Image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 2.5
          }}
        >
          {/* Type & Rating Badge */}
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Chip
              label={stay.type}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.9)",
                color: "#002d68",
                fontWeight: 800,
                fontSize: "0.75rem"
              }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5
              }}
            >
              <Star sx={{ color: "#ffa726", fontSize: 16 }} />
              <Typography variant="body2" fontWeight="800" color="text.primary">
                {stay.rating}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({stay.reviews})
              </Typography>
            </Box>
          </Box>

          {/* Name & Location */}
          <Box sx={{ color: "white" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                mb: 0.5,
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
              }}
            >
              {stay.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16, textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)" }} />
              <Typography
                variant="body2"
                sx={{
                  textShadow: "0 1px 4px rgba(0, 0, 0, 0.3)"
                }}
              >
                {stay.location}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Amenities Grid */}
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            display: "block",
            mb: 1.5,
            textTransform: "uppercase"
          }}
        >
          Amenities
        </Typography>

        {/* 3x3 Icon Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1.5,
            mb: 2.5
          }}
        >
          {(stay.amenities || []).slice(0, 9).map((amenity, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.8,
                p: 1.5,
                bgcolor: alpha("#002d68", 0.05),
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: alpha("#ff0080", 0.1),
                  transform: "translateY(-4px)"
                }
              }}
            >
              <Box sx={{ color: "#ff0080" }}>
                {getAmenityIcon(amenity)}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  textAlign: "center",
                  color: "text.primary"
                }}
              >
                {amenity}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Additional Amenities */}
        {(stay.amenities || []).length > 9 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {stay.amenities.slice(9).map((amenity, idx) => (
              <Chip
                key={idx}
                label={amenity}
                size="small"
                sx={{
                  bgcolor: alpha("#002d68", 0.08),
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.7rem"
                }}
              />
            ))}
          </Box>
        )}

        {/* Price & CTA */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            borderTop: "1px solid",
            borderColor: alpha("#000", 0.06)
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Per night from
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "#ff0080",
                fontWeight: 900
              }}
            >
              KES {(stay.price || stay.price_per_night || 0).toLocaleString()}
            </Typography>
          </Box>

          <Box
            className="book-btn"
            sx={{
              background: "linear-gradient(135deg, #002d68 0%, #004a9f 100%)",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: "0.9rem",
              transition: "all 0.3s ease",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 45, 104, 0.25)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(255, 0, 128, 0.35)"
              }
            }}
          >
            Book Now
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
