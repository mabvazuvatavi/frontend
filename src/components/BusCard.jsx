import { Box, Typography, Chip } from "@mui/material"
import {
  ArrowForward,
  AccessTime,
  Star,
  CheckCircle
} from "@mui/icons-material"
import { alpha } from "@mui/material"

export function BusCard({ bus, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "white",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid",
        borderColor: alpha("#000", 0.06),
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
          borderColor: "#ff0080",
          "& .bus-image-overlay": {
            background:
              "linear-gradient(135deg, rgba(255, 0, 128, 0.8) 0%, rgba(0, 45, 104, 0.8) 100%)"
          },
          "& .bus-route-arrow": {
            transform: "translateX(8px) scale(1.2)"
          }
        }
      }}
    >
      {/* Header with Image Background */}
      <Box
        sx={{
          position: "relative",
          height: 120,
          overflow: "hidden",
          backgroundImage: `url(${bus.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <Box
          className="bus-image-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0, 45, 104, 0.7) 0%, rgba(255, 0, 128, 0.6) 100%)",
            transition: "background 0.4s ease"
          }}
        />
        <Box
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 2.5
          }}
        >
          {/* Operator Name */}
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 800,
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              fontSize: "1.1rem"
            }}
          >
            {bus.operator}
          </Typography>

          {/* Rating Badge */}
          <Box
            sx={{
              alignSelf: "flex-end",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "rgba(255, 255, 255, 0.95)",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              backdropFilter: "blur(10px)"
            }}
          >
            <Star sx={{ color: "#ffa726", fontSize: 18 }} />
            <Typography variant="body2" fontWeight="800" color="text.primary">
              {bus.rating}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Route Section */}
      <Box sx={{ p: 3 }}>
        {/* Route Visual */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            position: "relative"
          }}
        >
          {/* From */}
          <Box sx={{ flex: 1, textAlign: "left" }}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            >
              From
            </Typography>
            <Typography variant="h6" fontWeight="800" color="primary.main">
              {bus.from}
            </Typography>
          </Box>

          {/* Arrow */}
          <Box
            sx={{
              position: "relative",
              mx: 2,
              display: "flex",
              alignItems: "center"
            }}
          >
            <Box
              sx={{
                height: 2,
                width: 60,
                bgcolor: alpha("#ff0080", 0.3),
                position: "relative"
              }}
            />
            <ArrowForward
              className="bus-route-arrow"
              sx={{
                position: "absolute",
                right: -8,
                color: "#ff0080",
                fontSize: 24,
                transition: "transform 0.3s ease"
              }}
            />
          </Box>

          {/* To */}
          <Box sx={{ flex: 1, textAlign: "right" }}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            >
              To
            </Typography>
            <Typography variant="h6" fontWeight="800" color="primary.main">
              {bus.to}
            </Typography>
          </Box>
        </Box>

        {/* Time Info */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2.5,
            p: 2,
            bgcolor: alpha("#002d68", 0.04),
            borderRadius: 2
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
            >
              <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Departure
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="700">
              {bus.departure}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 1,
              bgcolor: alpha("#000", 0.1),
              alignSelf: "stretch"
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
            >
              <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="700">
              {bus.duration}
            </Typography>
          </Box>
        </Box>

        {/* Amenities */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mb: 1, display: "block" }}
          >
            Amenities
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {(bus.amenities || []).slice(0, 3).map((amenity, idx) => (
              <Chip
                key={idx}
                icon={<CheckCircle sx={{ fontSize: 14 }} />}
                label={amenity}
                size="small"
                sx={{
                  bgcolor: alpha("#10b981", 0.1),
                  color: "#10b981",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  "& .MuiChip-icon": {
                    color: "#10b981"
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Price Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            borderTop: "2px solid",
            borderColor: alpha("#000", 0.06)
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Price per person
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "#ff0080",
                fontWeight: 900,
                display: "flex",
                alignItems: "baseline",
                gap: 0.5
              }}
            >
              KES {bus.price.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "#002d68",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "0.95rem",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#ff0080",
                transform: "scale(1.05)"
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
