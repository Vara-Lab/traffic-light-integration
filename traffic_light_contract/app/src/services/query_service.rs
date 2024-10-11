// necesary crates
use sails_rs::prelude::*;

use crate::states::traffic_light_state::{
    TrafficLightState,
    IoTrafficLightState
};

// Struct QueryService that will be used for all queries
#[derive(Default)]
pub struct QueryService;

#[service]
impl QueryService {
    // Service constructor
    pub fn new() -> Self {
        Self
    }

    // Remote call "traffic_light" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a query, keeping everything unchanged and returning some data. (&self)
    pub fn traffic_light(&self) -> IoTrafficLightState {
        TrafficLightState::state_ref()
            .to_owned()
            .into()
    }
}


