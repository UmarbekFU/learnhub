import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface CertificateIssuedProps {
  name: string;
  courseTitle: string;
  credentialId: string;
}

export default function CertificateIssued({ name, courseTitle, credentialId }: CertificateIssuedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your certificate for {courseTitle} is ready!</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto", maxWidth: "580px" }}>
          <Heading style={{ fontSize: "24px", color: "#333" }}>
            Congratulations!
          </Heading>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            Hi {name},
          </Text>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            You have successfully completed <strong>{courseTitle}</strong>!
            Your certificate of completion has been issued.
          </Text>
          <Text style={{ fontSize: "14px", color: "#555" }}>
            <strong>Credential ID:</strong> {credentialId}
          </Text>
          <Text style={{ fontSize: "14px", color: "#999", marginTop: "32px" }}>
            The LearnHub Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
