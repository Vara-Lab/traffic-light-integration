// necesary crates
use sails_rs::{
    prelude::*,
    gstd::service,
    cell::Ref
};

use crate::states::traffic_light_state::{
    IoTrafficLightState,
    TrafficLightState
};

// Struct QueryService that will be used for all queries
// Data is passed to the service as Ref (query, does not change state)
pub struct QueryService<'a> {
    traffic_light_state: Ref<'a, TrafficLightState>
}

#[service]
impl<'a> QueryService<'a> {
    // Service constructor
    pub fn new(traffic_light_state: Ref<'a, TrafficLightState>) -> Self {
        Self {
            traffic_light_state
        }
    }

    // Remote call "traffic_light" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a query, keeping everything unchanged and returning some data. (&self)
    pub fn traffic_light(&self) -> IoTrafficLightState {
        self
            .traffic_light_state
            .to_owned()
            .into()
    }
}


