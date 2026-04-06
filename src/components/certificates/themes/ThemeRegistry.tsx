import React from "react";

export function ModernDarkTheme({
  studentName = "Lagos Student",
  courseName = "Sample Mastery",
  date = new Date().toLocaleDateString(),
  primaryColor = "#3b82f6",
  logoUrl,
  signatureUrl,
}: any) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "1122px",
        height: "794px",
        background: `linear-gradient(135deg, #020617 0%, #0f172a 100%)`, // Deep premium dark
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Abstract Glowing Orbs (Satori Compatible Background FX) */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-20%",
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle, ${primaryColor}33 0%, rgba(0,0,0,0) 70%)`,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-40%",
          right: "-20%",
          width: "80%",
          height: "80%",
          background: `radial-gradient(circle, ${primaryColor}22 0%, rgba(0,0,0,0) 60%)`,
          zIndex: 0,
        }}
      />

      {/* Glassmorphic Inner Frame */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          width: "1022px",
          height: "694px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          padding: "60px 80px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Top Header Section */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ height: "48px", objectFit: "contain" }} />
          ) : (
             <div style={{ display: "flex", alignItems: "center" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
             </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ color: primaryColor, fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px" }}>Credential ID</span>
            <span style={{ color: "#64748b", fontSize: "12px", fontFamily: "monospace", marginTop: "4px" }}>{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
          </div>
        </div>

        {/* Central Typographic Lockup */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center", width: "100%" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 900,
              letterSpacing: "8px",
              textTransform: "uppercase",
              margin: "0 0 16px 0",
              color: primaryColor,
            }}
          >
            Certificate of Mastery
          </h1>

          <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "40px", letterSpacing: "1px" }}>
            THIS ACKNOWLEDGES THE OUTSTANDING PERFORMANCE OF
          </p>

          <h2
            style={{
              fontSize: "72px",
              fontWeight: 800,
              margin: "0 0 40px 0",
              textAlign: "center",
              color: "#ffffff",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            {studentName}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
            <div style={{ height: "1px", width: "80px", background: `linear-gradient(to right, transparent, ${primaryColor})` }} />
            <p style={{ fontSize: "16px", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "2px" }}>
              Successfully Completed
            </p>
            <div style={{ height: "1px", width: "80px", background: `linear-gradient(to left, transparent, ${primaryColor})` }} />
          </div>

          <h3 style={{ fontSize: "32px", fontWeight: 600, margin: "0", color: "#e2e8f0" }}>
            {courseName}
          </h3>
        </div>

        {/* Footer Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Conferred On</p>
            <p style={{ fontSize: "20px", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{date}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            {signatureUrl ? (
              <img src={signatureUrl} alt="Signature" style={{ height: "60px", objectFit: "contain" }} />
            ) : (
               <div style={{ height: "60px", width: "150px" }} />
            )}
            <div style={{ width: "200px", height: "1px", backgroundColor: "rgba(255,255,255,0.2)" }} />
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClassicGoldTheme({
  studentName = "Lagos Student",
  courseName = "Sample Mastery",
  date = new Date().toLocaleDateString(),
  primaryColor = "#d4af37", // Default to metallic gold
  logoUrl,
  signatureUrl,
}: any) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "1122px",
        height: "794px",
        backgroundColor: "#faf9f6", // Off-white luxury paper
        color: "#1e293b",
        fontFamily: "'Times New Roman', Times, serif",
        position: "relative",
        padding: "60px",
      }}
    >
      {/* Intricate Multi-layer Border SVG approach */}
      <div
        style={{
          position: "absolute",
          top: "30px", left: "30px", right: "30px", bottom: "30px",
          border: `4px solid ${primaryColor}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "42px", left: "42px", right: "42px", bottom: "42px",
          border: `1px solid ${primaryColor}`,
          opacity: 0.6
        }}
      />
      
      {/* Corner Accents */}
      {[
        { top: "25px", left: "25px" },
        { top: "25px", right: "25px" },
        { bottom: "25px", left: "25px" },
        { bottom: "25px", right: "25px" }
      ].map((pos, i) => (
        <div key={i} style={{ position: "absolute", ...pos, display: "flex" }}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" />
              <circle cx="12" cy="12" r="4" fill={primaryColor} />
           </svg>
        </div>
      ))}

      {/* Main Content Area */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", flex: 1, zIndex: 10 }}>
         {logoUrl ? (
           <img src={logoUrl} alt="Logo" style={{ height: "70px", objectFit: "contain", marginBottom: "40px", marginTop: "20px" }} />
         ) : (
           <div style={{ marginTop: "20px", marginBottom: "40px", display: "flex" }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1">
                 <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
           </div>
         )}
         
         <h1
           style={{
             fontSize: "56px",
             fontWeight: 400,
             textTransform: "uppercase",
             margin: "0 0 16px 0",
             color: "#0f172a",
             letterSpacing: "4px",
             whiteSpace: "nowrap"
           }}
         >
           Certificate of Completion
         </h1>
         
         <p style={{ fontSize: "20px", color: "#64748b", margin: "20px 0 30px 0", fontStyle: "italic", fontWeight: 300 }}>
           This is to certify that
         </p>
         
         <h2
           style={{
             fontSize: "72px",
             fontWeight: 600,
             margin: "0",
             textAlign: "center",
             color: primaryColor,
           }}
         >
           {studentName}
         </h2>
         
         <p style={{ fontSize: "18px", color: "#64748b", margin: "20px 0 10px 0", fontStyle: "italic" }}>
           has successfully demonstrated proficiency in
         </p>
         
         <h3 style={{ fontSize: "32px", fontWeight: 400, margin: "0", color: "#0f172a", textTransform: "uppercase", letterSpacing: "2px" }}>
           {courseName}
         </h3>
      </div>

      {/* Elegant Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          width: "100%",
          padding: "0 80px",
          paddingBottom: "30px",
          zIndex: 10
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <p style={{ fontSize: "24px", fontWeight: 400, margin: 0, color: "#1e293b" }}>{date}</p>
          <div style={{ width: "200px", height: "1px", backgroundColor: "#64748b" }} />
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Date Issued</p>
        </div>

        {/* Center Seal Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100px", height: "100px", transform: "translateY(10px)" }}>
           <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" fill="#faf9f6" stroke={primaryColor} strokeWidth="1" strokeDasharray="4 2" />
              <circle cx="50" cy="50" r="38" stroke={primaryColor} strokeWidth="2" />
              <path d="M50 30 L55 45 L70 50 L55 55 L50 70 L45 55 L30 50 L45 45 Z" fill={primaryColor} />
           </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          {signatureUrl ? (
             <img src={signatureUrl} alt="Signature" style={{ height: "60px", objectFit: "contain" }} />
          ) : (
             <div style={{ height: "60px", width: "150px" }} />
          )}
          <div style={{ width: "200px", height: "1px", backgroundColor: "#64748b" }} />
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Verified Signature</p>
        </div>
      </div>
    </div>
  );
}
