import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface EnrollmentConfirmationProps {
  name: string;
  courseTitle: string;
}

export default function EnrollmentConfirmation({ name, courseTitle }: EnrollmentConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re enrolled in {courseTitle}</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto", maxWidth: "580px" }}>
          <Heading style={{ fontSize: "24px", color: "#333" }}>
            Enrollment Confirmed!
          </Heading>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            Hi {name},
          </Text>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            You have been successfully enrolled in <strong>{courseTitle}</strong>.
            You can start learning right away from your dashboard.
          </Text>
          <Text style={{ fontSize: "14px", color: "#999", marginTop: "32px" }}>
            Happy learning!
            <br />
            The LearnHub Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
