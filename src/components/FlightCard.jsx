import { Box, Typography, Chip } from "@mui/material"
import { Flight, Star } from "@mui/icons-material"
import { alpha } from "@mui/material"

export function FlightCard({ flight, onClick }) {
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
          "& .flight-icon": {
            transform: "rotate(-45deg) scale(1.2)"
          }
        }
      }}
    >
      {/* Gradient Header with Info */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #002d68 0%, #004a9f 100%)",
          p: 2.5,
          color: "white"
        }}
      >
        {/* Airline & Metadata Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2
          }}
        >
          <Typography variant="h6" fontWeight="800">
            {flight.airline}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <Chip
              label={flight.class}
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.7rem"
              }}
            />
            <Chip
              label={`⭐ ${flight.rating}`}
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.7rem"
              }}
            />
          </Box>
        </Box>

        {/* Aircraft Info */}
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
          Aircraft: {flight.aircraft}
        </Typography>
      </Box>

      {/* Flight Path Animation SVG */}
      <Box sx={{ p: 2.5, bgcolor: alpha("#002d68", 0.03) }}>
        <svg
          width="100%"
          height="60"
          viewBox="0 0 300 60"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}
        >
          {/* Dashed line path */}
          <line
            className="flight-path-line"
            x1="20"
            y1="30"
            x2="280"
            y2="30"
            stroke="#ff0080"
            strokeWidth="2"
            strokeDasharray="8 4"
            style={{
              animation: "dashMove 2s linear infinite"
            }}
          />

          {/* Start circle */}
          <circle cx="20" cy="30" r="5" fill="#002d68" />

          {/* End circle */}
          <circle cx="280" cy="30" r="5" fill="#ff0080" />

          {/* Flight icon */}
          <g transform="translate(150, 30)">
            <Flight
              className="flight-icon"
              sx={{
                fontSize: 24,
                color: "#ff0080",
                transition: "transform 0.8s ease",
                transformOrigin: "center"
              }}
            />
          </g>

          <style>{`
            @keyframes dashMove {
              to {
                stroke-dashoffset: -12;
              }
            }
          `}</style>
        </svg>

        {/* Time Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1,
            color: "text.secondary"
          }}
        >
          <Box>
            <Typography variant="caption" display="block" sx={{ mb: 0.3 }}>
              {flight.from}
            </Typography>
            <Typography variant="body2" fontWeight="700" color="text.primary">
              {flight.departure}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              {flight.duration}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" display="block" sx={{ mb: 0.3 }}>
              {flight.to}
            </Typography>
            <Typography variant="body2" fontWeight="700" color="text.primary">
              {flight.arrival}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Boarding Pass Style Info Box */}
      <Box
        sx={{
          background: "linear-gradient(135deg, rgba(0, 45, 104, 0.05) 0%, rgba(255, 0, 128, 0.05) 100%)",
          p: 2.5,
          borderTop: "2px dashed",
          borderColor: alpha("#ff0080", 0.3)
        }}
      >
        {/* Boarding Pass Details */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2.5
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
              Gate
            </Typography>
            <Typography variant="body2" fontWeight="700">
              {flight.gate || "TBA"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
              Seat
            </Typography>
            <Typography variant="body2" fontWeight="700">
              {flight.seat || "Select seat"}
            </Typography>
          </Box>
        </Box>

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
              Price per passenger
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "#ff0080",
                fontWeight: 900
              }}
            >
              KES {flight.price.toLocaleString()}
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
            Book Flight
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
