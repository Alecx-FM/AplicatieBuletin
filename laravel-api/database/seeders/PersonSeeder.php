<?php

namespace Database\Seeders;

use App\Models\Person;
use Illuminate\Database\Seeder;
use Faker\Factory as FakerFactory;
use Carbon\Carbon;

class PersonSeeder extends Seeder
{
    public function run(): void
    {
        $examples = [
            [
                'last_name' => 'Fechete',
                'first_name' => 'Alex',
                'birth_date' => '2004-01-04',
                'national_id' => '5010401342525',
                'cin_series' => 'SB',
                'cin_number' => '500343',
                'id_issue_date' => '2021-01-01',
                'id_expiry_date' => '2031-01-01',
                'city' => 'Sibiu',
                'address' => 'Intrarea Siretului Nr.3',
                'county' => 'Sibiu',
                'email' => 'Mihai@yahoo.com',
                'phone' => '0742943385',
                'notes' => 'Note',
            ],
            [
                'last_name' => 'Popescu',
                'first_name' => 'Mihai',
                'birth_date' => '1998-05-12',
                'national_id' => '1980512123456',
                'cin_series' => 'B',
                'cin_number' => '123456',
                'id_issue_date' => '2020-06-15',
                'id_expiry_date' => '2030-06-15',
                'city' => 'Bucuresti',
                'address' => 'Str. Lalelelor 10',
                'county' => 'Bucuresti',
                'email' => 'mihai.popescu@example.com',
                'phone' => '0712345678',
                'notes' => null,
            ],
            [
                'last_name' => 'Ionescu',
                'first_name' => 'Ana',
                'birth_date' => '2001-09-21',
                'national_id' => '6010921123456',
                'cin_series' => 'CJ',
                'cin_number' => '789012',
                'id_issue_date' => '2019-09-21',
                'id_expiry_date' => '2029-09-21',
                'city' => 'Cluj-Napoca',
                'address' => 'Bd. Eroilor 3',
                'county' => 'Cluj',
                'email' => 'ana.ionescu@example.com',
                'phone' => '0722334455',
                'notes' => 'Student',
            ],
        ];

        foreach ($examples as $e) {
            Person::create($e);
        }

        // Generate 17 more random Romanian-style entries to reach 20 total
        $faker = FakerFactory::create('ro_RO');
        $series = ['B', 'CJ', 'SB', 'TM', 'IS', 'PH', 'GL', 'BR', 'BV', 'CT'];
        $counties = ['Bucuresti','Cluj','Sibiu','Timis','Iasi','Prahova','Galati','Braila','Brasov','Constanta'];

        for ($i = 0; $i < 17; $i++) {
            $first = $faker->firstName;
            $last = $faker->lastName;
            $birth = $faker->date('Y-m-d', '2010-12-31');
            $cnp = $faker->numerify('##########'); // placeholder 10 digits
            $ser = $faker->randomElement($series);
            $cin = (string)$faker->numberBetween(100000, 999999);
            $city = $faker->city;
            $address = 'Str. '.$faker->streetName.' '.$faker->numberBetween(1, 100);
            $county = $faker->randomElement($counties);
            $email = strtolower($first).'.'.strtolower($last).'@example.com';
            $phone = '07'.$faker->numberBetween(10000000, 99999999);

            // ID issue/expiry dates
            $issue = Carbon::instance($faker->dateTimeBetween('-10 years', '-1 month'));
            // 30% expired, otherwise future expiry; always >= issue
            if ($faker->boolean(30)) {
                $upperPast = Carbon::now()->subDay();
                // ensure upperPast >= issue
                if ($upperPast->lessThan($issue)) {
                    $upperPast = $issue->copy()->addMonths(6);
                }
                $expiry = Carbon::instance($faker->dateTimeBetween($issue, $upperPast));
            } else {
                $expiry = $issue->copy()->addYears($faker->numberBetween(1, 10));
            }

            Person::create([
                'first_name' => $first,
                'last_name' => $last,
                'birth_date' => $birth,
                'national_id' => $cnp,
                'cin_series' => $ser,
                'cin_number' => $cin,
                'id_issue_date' => $issue->toDateString(),
                'id_expiry_date' => $expiry->toDateString(),
                'city' => $city,
                'address' => $address,
                'county' => $county,
                'email' => $email,
                'phone' => $phone,
                'notes' => null,
            ]);
        }
    }
}
