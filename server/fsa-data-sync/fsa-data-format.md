# XML Format: Food Hygiene Rating Data

This document outlines the structure of the XML files containing food hygiene rating data. It includes the high-level structure, detailed examples of `<EstablishmentDetail>`, and explanations of each component.

---

## High-Level XML Structure

```xml
<FHRSEstablishment xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Header>
        <ExtractDate>2025-01-04</ExtractDate>
        <ItemCount>1354</ItemCount>
        <ReturnCode>Success</ReturnCode>
    </Header>
    <EstablishmentCollection>
        <!-- Establishment details go here -->
    </EstablishmentCollection>
</FHRSEstablishment>

Explanation:
<FHRSEstablishment>:
Root element of the XML document.
Contains metadata and the collection of establishments.
<Header>:
Provides metadata about the file, such as:
<ExtractDate>: Date the file was generated.
<ItemCount>: Number of establishments in the collection.
<ReturnCode>: Status of the file generation.
<EstablishmentCollection>:
Contains all the establishment data as multiple <EstablishmentDetail> elements.

<EstablishmentDetail>
    <FHRSID>1583332</FHRSID>
    <LocalAuthorityBusinessID>79533</LocalAuthorityBusinessID>
    <BusinessName>1st Steps Day Nursery LTD</BusinessName>
    <BusinessType>Hospitals/Childcare/Caring Premises</BusinessType>
    <BusinessTypeID>5</BusinessTypeID>
    <AddressLine1>Eastbrook Secondary School Site</AddressLine1>
    <AddressLine2>Dagenham Road</AddressLine2>
    <AddressLine4>Dagenham</AddressLine4>
    <PostCode>RM10 7UP</PostCode>
    <RatingValue>4</RatingValue>
    <RatingKey>fhrs_4_en-GB</RatingKey>
    <RatingDate>2024-03-13</RatingDate>
    <LocalAuthorityCode>501</LocalAuthorityCode>
    <LocalAuthorityName>Barking and Dagenham</LocalAuthorityName>
    <LocalAuthorityWebSite>http://www.lbbd.gov.uk/Pages/Home.aspx</LocalAuthorityWebSite>
    <LocalAuthorityEmailAddress>foodsafety@lbbd.gov.uk</LocalAuthorityEmailAddress>
    <Scores>
        <Hygiene>0</Hygiene>
        <Structural>10</Structural>
        <ConfidenceInManagement>10</ConfidenceInManagement>
    </Scores>
    <SchemeType>FHRS</SchemeType>
    <NewRatingPending>False</NewRatingPending>
    <Geocode>
        <Longitude>0.1642449</Longitude>
        <Latitude>51.5523755</Latitude>
    </Geocode>
</EstablishmentDetail>

Explanation:
<FHRSID>: Unique identifier for the establishment in the FHRS system.
<LocalAuthorityBusinessID>: Local authority's internal business ID.
<BusinessName>: Name of the business.
<BusinessType>: Type of business (e.g., restaurant, childcare premises).
<BusinessTypeID>: Numerical ID corresponding to the business type.
Address Fields:
<AddressLine1>, <AddressLine2>, <AddressLine4>, <PostCode>: Contains details of the establishment's address.
Rating Fields:
<RatingValue>: Hygiene rating (e.g., 4 or 5).
<RatingKey>: Key corresponding to the rating.
<RatingDate>: Date of the rating.
Local Authority Fields:
<LocalAuthorityName>, <LocalAuthorityCode>: The local authority responsible for the establishment.
<LocalAuthorityWebSite>, <LocalAuthorityEmailAddress>: Contact details for the local authority.
<Scores>:
<Hygiene>, <Structural>, <ConfidenceInManagement>: Scores assigned to different aspects of the inspection.
Geocode Fields:
<Longitude>, <Latitude>: Geographical location of the establishment.
<SchemeType>: Scheme type (e.g., FHRS).
<NewRatingPending>: Indicates whether a new rating is pending.




Option 1;
1. Download Local Authorities list
2. Get 