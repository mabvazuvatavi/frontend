import { Box, Typography, Chip } from "@mui/material"
import { LocationOn, Event, ArrowForward } from "@mui/icons-material"
import { alpha } from "@mui/material"

export function EventCard({ event, onClick }) {
  const startDate = event.start_date ? new Date(event.start_date) : null
  const month = startDate
    ? startDate.toLocaleString("en-US", { month: "short" }).toUpperCase()
    : "TBA"
  const day = startDate ? startDate.getDate() : ""

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        height: 480,
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid",
        borderColor: alpha("#000", 0.06),
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
          "& .event-overlay": {
            background:
              "linear-gradient(135deg, rgba(255, 0, 128, 0.9) 0%, rgba(0, 45, 104, 0.9) 100%)"
          },
          "& .event-cta": {
            transform: "translateX(8px)"
          }
        }
      }}
    >
      {/* Full-screen image background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${event.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      {/* Gradient overlay */}
      <Box
        className="event-overlay"
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(0, 45, 104, 0.6) 0%, rgba(255, 0, 128, 0.4) 100%)",
          transition: "background 0.4s ease"
        }}
      />

      {/* Content Container */}
      <Box
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 3.5
        }}
      >
        {/* Top Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Date Badge */}
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: 2.5,
              px: 2.5,
              py: 2,
              textAlign: "center",
              minWidth: 80
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#ff0080",
                fontWeight: 800,
                display: "block",
                fontSize: "0.75rem",
                mb: 0.5
              }}
            >
              {month}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: "#002d68",
                fontWeight: 900,
                lineHeight: 1
              }}
            >
              {day}
            </Typography>
          </Box>

          {/* Category Chip */}
          <Chip
            label={event.category}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.9)",
              color: "#002d68",
              fontWeight: 800,
              fontSize: "0.75rem",
              backdropFilter: "blur(10px)"
            }}
          />
        </Box>

        {/* Bottom Glassmorphic Box */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: 2.5,
            p: 3,
            border: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.2)"
          }}
        >
          {/* Event Title */}
          <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: 900,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {event.title}
          </Typography>

          {/* Location */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2.5,
              color: "rgba(255, 255, 255, 0.85)"
            }}
          >
            <LocationOn sx={{ fontSize: 18, color: "#ff0080" }} />
            <Typography variant="body2" fontWeight="600">
              {event.location || event.venue_name}
            </Typography>
          </Box>

          {/* Price & CTA */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid",
              borderColor: "rgba(255, 255, 255, 0.2)",
              pt: 2
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  display: "block",
                  mb: 0.5
                }}
              >
                From
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#ff0080",
                  fontWeight: 900
                }}
              >
                {event.price}
              </Typography>
            </Box>

            <Box
              className="event-cta"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "#ff0080",
                color: "white",
                px: 2.5,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "0.9rem",
                transition: "transform 0.3s ease",
                cursor: "pointer"
              }}
            >
              View Event
              <ArrowForward sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
