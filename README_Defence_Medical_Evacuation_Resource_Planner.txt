
Defence Medical Evacuation Resource Planner

Hybrid AI + Quantum Decision-Support Platform for Emergency Medical Logistics

Project category: HealthTech | AI & Quantum Computing
Team: Techpulse
Team ID: CAN-TEAM-000466
Purpose: Help authorised defence/emergency coordinators plan patient
evacuation and allocate scarce medical resources across zones, hospitals
and response teams.

------------------------------------------------------------------------

1. Project Overview

The Defence Medical Evacuation Resource Planner is a decision-support
system for large-scale emergencies in which several locations may need
medical help at the same time. It combines:

1.  AI/ML forecasting to estimate how many patients may need assistance
    in each zone.
2.  Classical optimisation to create a conventional, explainable
    allocation baseline.
3.  Quantum-inspired / quantum optimisation workflow using a QUBO model
    and the QAOA algorithm to explore constrained resource-allocation
    choices.
4.  Validation and human approval to check whether a proposed plan is
    feasible before it is used.

The system recommends which available medical teams, ambulances,
hospital beds and supplies should be assigned to which zones or
patients, while considering demand, capacity, availability, travel
estimates, skills and priority.

Important: This is a planning and decision-support prototype, not an
autonomous dispatch authority or a replacement for trained medical and
defence personnel. A coordinator must review and approve every
operational plan. The project proposal describes QAOA/QUBO processing;
actual quantum-hardware execution is optional and must not be claimed
unless it is implemented and tested. A simulator or classical QAOA
simulation can be used for the prototype.

2. Problem Statement

During a major emergency, multiple zones can generate simultaneous
patient demand. Resources may be limited or spread across different
locations. Coordinators need to answer questions such as:

-   How many patients are expected in each affected zone?
-   Which hospital has suitable capacity and services?
-   Which ambulance or medical team can respond?
-   What route and estimated travel time should be considered?
-   How should beds, teams, ambulances and supplies be distributed
    fairly?
-   What demand cannot be covered, and why?

Separate emergency call systems, GPS tools, hospital systems and
inventory systems may each provide useful information, but they do not
necessarily produce one coordinated, constraint-aware medical evacuation
plan.

3. Proposed Solution

Provide one operational dashboard with a shared view of:

-   Emergency zones and incident reports
-   Patient counts and predicted demand
-   Ambulance and medical-team availability
-   Hospital location, specialty and remaining capacity
-   Bed and medical-supply availability
-   Route and estimated travel time
-   Recommended assignments, shortages and reasons
-   Classical-versus-QAOA result comparison

The planner should produce a feasible recommendation where possible. If
demand exceeds supply, it should clearly show unmet demand and the
constraints causing the shortage instead of presenting an impossible
plan as successful.

4. Users and Roles

Emergency / defence coordinator - Creates an incident and defines
affected zones. - Reviews demand forecasts and resource status. - Runs
classical and quantum optimisation. - Compares candidate plans and
approves or rejects a recommendation.

Hospital coordinator - Updates bed capacity, specialties, intake limits
and supply status. - Confirms whether a proposed patient transfer can be
accepted.

Field / ambulance coordinator - Updates ambulance location,
availability, team skills and status. - Reviews assigned pickup and
destination details.

Administrator - Manages authorised users, reference data, audit logs and
system settings.

Use role-based access. Do not expose sensitive operational locations or
patient information to unauthorised users.

5. End-to-End Workflow

1.  Create emergency scenario: An authorised user enters the incident
    name, time, affected zones and scenario settings.
2.  Enter or import data: Add reported patient counts, zone details,
    hospitals, ambulances, medical teams, beds, supplies and travel
    estimates.
3.  Validate and preprocess: Check missing values, duplicates, units,
    capacity values and data freshness. Standardise the data.
4.  Predict demand: The AI/ML module estimates expected patients per
    zone from available historical or scenario data. Show the estimate
    and its confidence/uncertainty where supported.
5.  Build optimisation problem: Convert the forecast and resource
    constraints into a classical optimisation model and a QUBO
    representation.
6.  Solve both paths: Run a classical baseline and the QAOA path (on a
    simulator or supported quantum backend). Record runtime and solver
    status.
7.  Validate candidates: Check every assignment against hospital
    capacity, resource availability, team skills, supply limits and
    other configured constraints.
8.  Compare and review: Display covered patients, unmet demand, travel
    cost, constraint violations, runtime and the reasons for the
    recommended plan.
9.  Approve and publish: A human coordinator approves the plan before it
    is shared with field teams.
10. Monitor and re-plan: When demand, route conditions, hospital
    capacity or resource availability changes, update the scenario and
    run the planning process again.

6. Two Optimisation Paths: Classical and Quantum

The project must make the distinction between the two paths clear in
both its architecture and user interface.

A. Classical computing path (baseline)

A conventional optimisation solver uses the same scenario data,
objective and constraints as the quantum path. It can use linear
programming, mixed-integer linear programming or another suitable
classical method.

Purpose - Provide a dependable baseline for comparison. - Solve the
allocation problem using conventional optimisation. - Validate the
objective function and constraints before evaluating QAOA. - Act as a
fallback if the quantum path is unavailable or returns no feasible
candidate.

Example output: Assign ambulance A and team T to zone 1, route patients
to hospital H1 within its available capacity, and report any remaining
unmet demand.

B. Quantum optimisation path (QUBO + QAOA)

QUBO means Quadratic Unconstrained Binary Optimisation. It represents
the decision problem using binary variables and a quadratic objective.
Constraints are represented through penalty terms.

Example assignment variable:

x[i,j] = 1 if resource i is assigned to zone j; otherwise 0.

The QUBO objective can combine: - Unmet patient demand penalty -
Estimated travel-time or distance cost - Resource-use cost - Assignment
preference or priority terms - Penalties for violating capacity,
availability, skill or supply constraints

QAOA means Quantum Approximate Optimisation Algorithm. The QAOA workflow
uses: 1. A cost Hamiltonian derived from the QUBO objective. 2. A
parameterised quantum circuit. 3. Repeated circuit evaluation /
measurement. 4. A classical optimiser to update circuit parameters. 5.
Candidate bitstrings that are decoded into resource assignments.

The candidate assignments must be checked by the same independent
validation rules used for the classical result.

Important implementation note: QAOA is a hybrid quantum-classical
algorithm. A quantum simulator can demonstrate the workflow, but
simulation is not proof of quantum advantage. Compare solution quality,
feasibility and runtime fairly against the classical baseline using the
same test cases and hardware conditions.

7. Objective and Constraints

A simplified planning objective is:

Minimise: unmet-demand penalty + estimated travel cost + resource-use
cost + constraint-violation penalties.

Possible constraints include:

-   A resource cannot be assigned to more than one task at the same
    time.
-   A hospital cannot receive more patients than its available intake
    capacity.
-   A hospital can receive only patients for services it supports,
    subject to configured rules.
-   Ambulance and medical-team availability must be respected.
-   Team skills must match the task requirements.
-   Bed, medicine and equipment limits must not be exceeded.
-   Patient priority must be considered according to authorised medical
    rules.
-   Travel estimates and route restrictions must be considered.
-   Every assignment must be traceable to the scenario and data version
    used.

Clinical triage and priority rules must be defined and approved by
qualified authorities. The software should not invent medical priority
rules.

8. Technical Architecture

Input layer - Zones and incident reports - Hospitals and service
capacity - Ambulances and locations - Medical teams and skills - Beds,
medicines and supplies - Demand signals and travel-cost estimates -
Scenario settings

Data preparation layer - Validation, cleaning and standardisation -
Missing-data flags and timestamps - Scenario-specific data snapshot

AI/ML layer - Demand prediction by zone - Pattern recognition and
context-aware analysis - Forecast quality and uncertainty reporting

Optimisation layer - Classical optimisation model - QUBO formulation and
penalty configuration - QAOA circuit and parameter optimisation -
Candidate-solution decoding

Validation layer - Capacity and availability checks - Skill and supply
checks - Feasibility status and shortage explanations - Comparison
against classical baseline

Application layer - Role-based dashboard - Scenario creation and
monitoring - Map and route view - Allocation review and approval -
Exportable allocation plan and audit history

9. Suggested User Interface / User Experience

Design for a high-pressure emergency environment: clear, readable,
low-clutter and usable on desktop, tablet and mobile.

Main dashboard

-   Top status bar: incident name, scenario time, data freshness and
    system status.
-   Summary cards: reported patients, predicted patients, available
    ambulances, available teams, hospital beds and unmet demand.
-   Map: affected zones, active ambulances, hospitals and recommended
    routes.
-   Alerts: critical shortages, unavailable resources, stale data and
    capacity warnings.

Emergency setup screen

-   Create/select an incident.
-   Add zones on a map or from a structured list.
-   Enter reported patient counts and urgency categories using approved
    definitions.
-   Import resource and hospital data.
-   Show required fields and validation errors immediately.

Optimisation screen

-   Clearly separate Classical Baseline and QAOA / Quantum Path.
-   Show selected scenario, objective settings and constraints before
    execution.
-   Show run status and elapsed time without promising a fixed speed.
-   Display whether QAOA ran on a simulator or actual quantum hardware.
-   Allow the coordinator to compare results side by side.

Allocation results screen

For each zone, show: - Reported and predicted patient count - Assigned
ambulance(s) and medical team(s) - Destination hospital and accepted
patient count - Estimated route / travel time and its source - Beds and
supplies reserved - Remaining unmet demand - Validation status and
explanation

Use clear status labels such as Feasible, Needs Review, Shortage, and
Not Feasible. Do not rely on colour alone; include text and icons. Make
critical actions large and require confirmation before publishing a
plan.

Approval and audit screen

-   Show who created, changed, reviewed and approved a plan.
-   Preserve the input snapshot, model version, solver settings and
    validation results.
-   Provide a clear reject / revise / approve workflow.
-   Never silently overwrite an approved allocation.

10. Data Model / Database Design

Use traceable, scenario-linked records. Suggested entities:

-   Scenario: scenario ID, name, time, status, assumptions and
    configuration.
-   Zone: zone ID, scenario ID, location, demand features and reported
    patient count.
-   Hospital: hospital ID, location, specialties, service capacity and
    intake limits.
-   Resource: resource ID, type (ambulance, team, bed or supply),
    location, skills, quantity, availability and status.
-   Forecast: forecast ID, scenario ID, zone ID, predicted demand, model
    version and timestamp.
-   RouteEstimate: origin, destination, estimated distance/time, source
    and timestamp.
-   OptimisationRun: run ID, scenario ID, solver type, objective
    settings, QUBO version, parameters, runtime and status.
-   Allocation: run ID, zone, resource, hospital, assigned quantity,
    candidate status and validation result.
-   Approval / AuditLog: user, action, timestamp, reason and
    previous/new plan version.

Keep patient-identifiable information to the minimum necessary. Use
access control, encryption, retention rules and audit logging
appropriate to the deployment environment.

11. Recommended Technology Stack

The exact stack can be selected by the implementation team. A practical
prototype may use:

-   Frontend: React or another modern web framework; responsive
    dashboard and map interface.
-   Backend: Python with FastAPI or Flask.
-   Data processing: Pandas and standard validation utilities.
-   Forecasting: Scikit-learn or suitable time-series / ML libraries,
    depending on available data.
-   Classical optimisation: OR-Tools, PuLP, Pyomo or another suitable
    solver.
-   Quantum workflow: Qiskit or another QUBO/QAOA-compatible framework
    and simulator.
-   Database: PostgreSQL or SQLite for a small demonstration.
-   Maps / routes: A mapping and routing provider or clearly labelled
    simulated travel estimates.
-   Deployment: Local demo or secured cloud environment, depending on
    data sensitivity.

These are suggested implementation choices, not claims that every
component is already implemented.

12. Validation, Evaluation and Success Metrics

Evaluate both optimisation paths on identical scenarios.

  -----------------------------------------------------------------------
  Measure                             What it tells us
  ----------------------------------- -----------------------------------
  Feasibility rate                    Share of runs that satisfy all hard
                                      constraints

  Unmet demand                        Patients not covered by the
                                      proposed allocation

  Capacity violations                 Number of bed, team, ambulance or
                                      supply-limit breaches

  Resource utilisation                Share of available resources
                                      assigned

  Modelled travel cost                Estimated travel time or distance
                                      for assignments

  Forecast quality                    MAE or another suitable forecast
                                      error measure

  Solver runtime                      Time taken to produce a candidate
                                      and validate it

  Scenario stability                  Whether similar inputs produce
                                      reasonably consistent plans
  -----------------------------------------------------------------------

Test normal demand, sudden demand spikes, hospital closure, ambulance
unavailability, missing data, route disruption and changes in supply.
Report assumptions and test conditions alongside results.

13. Risks, Limitations and Mitigations

  -----------------------------------------------------------------------
  Risk / limitation                   Mitigation
  ----------------------------------- -----------------------------------
  Incomplete or synthetic data        Label simulated data; validate
                                      inputs; document assumptions

  Uncertain patient-demand forecasts  Show uncertainty; test multiple
                                      demand scenarios; allow manual
                                      correction

  Simplified travel-time estimates    Display source and timestamp;
                                      integrate trusted routing data when
                                      available

  Conflicting resource-allocation     Use approved priority rules and
  priorities                          transparent objective weights

  QAOA may not outperform classical   Benchmark fairly; keep classical
  solvers                             baseline and fallback

  QUBO penalty choices may affect     Document weights and test
  results                             sensitivity

  Quantum simulator runtime may be    Limit problem size for demos;
  high                                report runtime honestly

  Operational data may be sensitive   Apply role-based access, encryption
                                      and audit controls

  Incorrect or stale field updates    Timestamp updates and require
                                      confirmation for critical changes
  -----------------------------------------------------------------------

14. Existing Systems and Project Positioning

The proposal identifies the following systems/categories for study:

-   ERSS-112: emergency call handling and response coordination; the
    proposed planner focuses on integrated medical resource allocation.
-   Ambulance dispatch and GPS: tracking and availability; the proposed
    planner adds cross-resource and hospital-capacity planning.
-   Hospital management systems: admissions and bed availability; the
    proposed planner aims to coordinate across multiple hospitals and
    zones.
-   OpenLMIS / mSupply: medical inventory management; the proposed
    planner includes supply constraints in evacuation planning.
-   ArcGIS Network Analyst: route and travel-time analysis; the proposed
    planner uses travel estimates as part of an overall allocation
    objective.
-   AI-based demand forecasting: predicts demand; the proposed planner
    combines forecasts with constrained allocation.

These are positioning points from the project proposal and should be
verified against the exact capabilities and integrations of each product
before making formal comparative claims.

15. Development Roadmap

1.  Scenario library: define emergency scenarios and synthetic test
    datasets.
2.  Data and forecast module: build input validation and zone-level
    demand forecasting.
3.  Classical baseline: implement and test the conventional allocation
    solver.
4.  QUBO formulation: encode the same objective and constraints as a
    QUBO.
5.  QAOA simulation: generate candidate solutions and decode
    assignments.
6.  Validation and benchmarking: compare feasibility, unmet demand,
    travel cost and runtime.
7.  Dashboard and map: implement scenario entry, results, alerts and
    review screens.
8.  Human approval and audit: add role permissions, approvals and
    traceable run history.
9.  Pilot evaluation: review assumptions and workflows with qualified
    emergency-medical and defence logistics stakeholders before any
    real-world use.

16. Demonstration Flow for the Hackathon

A clear demo can follow this sequence:

1.  Open a sample emergency scenario with several affected zones.
2.  Show reported patients and AI-predicted demand by zone.
3.  Show available ambulances, teams, hospital beds and supplies.
4.  Run the classical optimiser and display its allocation.
5.  Run the QAOA simulator and display its candidate allocation.
6.  Compare feasibility, unmet demand, travel estimate and runtime.
7.  Open a shortage explanation to show which constraint caused it.
8.  Change one condition (for example, reduce a hospital’s available
    beds) and re-run.
9.  Show the updated recommendation and request human approval.

Use synthetic data for the public hackathon demonstration unless
authorised, privacy-safe operational data is available. Clearly label
all simulated locations, patient counts and travel estimates.

17. Expected Impact

-   A unified view of demand, resources and hospital capacity.
-   More transparent, constraint-aware allocation recommendations.
-   Faster scenario comparison and preparedness planning.
-   Clearer visibility into shortages and unmet demand.
-   A measurable comparison between classical optimisation and a
    QUBO/QAOA workflow.
-   Human-reviewed plans with traceable assumptions and decisions.

18. Final Note

The main contribution is not simply “using quantum computing.” It is a
complete, explainable emergency medical resource-planning workflow in
which AI estimates demand, classical optimisation provides a baseline,
QUBO/QAOA explores an additional optimisation path, and independent
validation plus human approval protect the final decision.

Build the system to recommend, explain, validate and support decisions —
never to dispatch or make clinical decisions autonomously.
